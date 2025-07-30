import boto3
import botocore
from config.storage import AWSS3StorageConfig
from io import BytesIO
from modules.utils.http_request import bare_request, driver_image_download_request
from connectors.cache.file_storage import FileStorageCacheTableConnector
from urllib.parse import urlparse, unquote
from datetime import datetime, timezone, timedelta
from concurrent.futures.process import ProcessPoolExecutor
from PIL import Image
import numpy as np
import base64
import mimetypes
from uuid import uuid4

SESSION = boto3.session.Session()
CLIENT = SESSION.client(
    "s3",
    endpoint_url=AWSS3StorageConfig.ENDPOINT,
    config=botocore.config.Config(
        s3={"addressing_style": "virtual"}
    ),  # Configures to use subdomain/virtual calling format.
    region_name=AWSS3StorageConfig.REGION,  # Use the region in your endpoint.
    aws_access_key_id=AWSS3StorageConfig.ACCESS_KEY_ID,  # Access key pair. You can create access key pairs using the control panel or API.
    aws_secret_access_key=AWSS3StorageConfig.ACCESS_KEY_SECRET,
)

special_treatment_host = ["batdongsan.com.vn"]
root_folder = "new"


def create_date_folder_name():
    return datetime.now(timezone(timedelta(hours=7))).strftime("%Y%m%d")


def special_image_download(url: str):
    if any([host in url for host in special_treatment_host]):
        data = driver_image_download_request(url)
        image_data = base64.b64decode(data)
        return image_data
    else:
        return None


def save_to_cloud(filename: str, content: bytes, stable: bool = False):
    if not content or len(content) == 0:
        return None

    if not filename:
        return None

    sub_folder = create_date_folder_name() if not stable else "stable"
    content_type, _ = mimetypes.guess_type(filename)

    if not content_type:
        folder = "any"
        content_type = "application/octet-stream"
    else:
        folder = content_type.split("/")[0]

    object_key = f"{root_folder}/{folder}/{sub_folder}/{filename}"

    try:
        response = CLIENT.put_object(
            Bucket=AWSS3StorageConfig.BUCKET,
            Key=object_key,
            Body=BytesIO(content),  # Dữ liệu file
            ACL="public-read",  # Cho phép public
        )

        if response.get("ResponseMetadata", {}).get("HTTPStatusCode") != 200:
            return None

        return AWSS3StorageConfig.FILE_URL(object_key)
    except Exception as e:
        print(e)
        return None


def download_to_cloud(url: str, stable: bool = False) -> str:
    connector = None

    try:
        connector = FileStorageCacheTableConnector()
        cdn_url = connector.find_record(old_url=url)
        connector.close()
        connector = None

        if cdn_url:
            return cdn_url
    except:
        if connector:
            connector.close()
            connector = None

    try:
        # url = unquote(url)
        parsed_url = urlparse(url)
        path = parsed_url.path
        filename = path.split("/")[-1]

        if not filename or len(filename) == 0:
            return None

        sub_folder = create_date_folder_name() if not stable else "stable"
        content_type, _ = mimetypes.guess_type(filename)

        if not content_type:
            folder = "any"
            content_type = "application/octet-stream"
        else:
            folder = content_type.split("/")[0]

        try:
            content = bare_request(url, timeout=(3, 6))
        except Exception as e:
            content = special_image_download(url)

        if not content:
            return None

        if folder == "image":
            min_width, min_height = 500, 500
            image = Image.open(BytesIO(content))
            array = np.array(image)

            if array.shape[0] < min_height and array.shape[1] < min_width:
                return None

        cdn_url = None

        attempts = 1
        while attempts <= 10:
            try:
                object_key = f"{root_folder}/{folder}/{sub_folder}/{str(uuid4())}.jpg"
                cdn_url = AWSS3StorageConfig.FILE_URL(object_key)

                response = CLIENT.put_object(
                    Bucket=AWSS3StorageConfig.BUCKET,
                    Key=object_key,
                    Body=BytesIO(content),  # Dữ liệu file
                    ACL="public-read",  # Cho phép public
                )

                if response.get("ResponseMetadata", {}).get("HTTPStatusCode") != 200:
                    raise RuntimeError("Upload failed")

                test_content = bare_request(cdn_url, timeout=30)
                del test_content

                break
            except Exception as e:
                cdn_url = None
                attempts += 1

        if not cdn_url:
            return None

        connector = None
        try:
            connector = FileStorageCacheTableConnector()
            connector.insert_record(old_url=url, new_url=cdn_url)
            connector.close()
            connector = None
        except:
            if connector:
                connector.close()
                connector = None

        return cdn_url
    except Exception as e:
        return None


def concurrent_download_to_cloud(urls: list[str]):
    if len(urls) == 0:
        return []

    num_processes = min(5, len(urls))

    with ProcessPoolExecutor(num_processes) as executor:
        new_urls = list(executor.map(download_to_cloud, urls))
        return new_urls
