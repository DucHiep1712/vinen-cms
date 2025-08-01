from urllib.parse import quote
import os


class AWSS3StorageConfig:
    ACCESS_KEY_ID = os.environ["AWS_S3_KEY_ID"]
    ACCESS_KEY_SECRET = os.environ["AWS_S3_KEY_SECRET"]
    REGION = os.environ["AWS_S3_REGION"]
    BUCKET = os.environ["AWS_S3_BUCKET"]
    ENDPOINT = f"https://{REGION}.digitaloceanspaces.com"
    FILE_URL = lambda filepath: quote(
        "https://"
        + AWSS3StorageConfig.BUCKET
        + "."
        + AWSS3StorageConfig.REGION
        + ".digitaloceanspaces.com/"
        + filepath,
        safe=":/",
    )
