# Session Timeout System

## Overview

The viNen CMS now includes a comprehensive session timeout system that automatically manages user sessions and ensures security by requiring re-authentication after 1 minute (for testing purposes).

## Features

### 1. Automatic Session Expiration
- Sessions automatically expire after 1 minute from login (testing configuration)
- Users are automatically logged out when their session expires
- All protected routes redirect to login page when session is invalid

### 2. Session Monitoring
- Real-time countdown timer showing remaining session time
- Automatic session validation every minute
- Session status displayed in the navigation bar

### 3. User Experience Features
- **30-second warning**: Users receive a prominent warning 30 seconds before session expiration (testing configuration)
- **Session refresh**: Users can manually extend their session by another 1 minute
- **Auto-refresh**: Sessions automatically refresh after 30 minutes of user activity
- **Graceful logout**: Users are notified when their session expires

### 4. Security Features
- Protected routes automatically check session validity
- Invalid or expired sessions are immediately cleared
- Users cannot access protected content with expired sessions

## How It Works

### Session Creation
When a user logs in:
1. A session is created with current timestamp
2. Expiration time is set to 1 minute from login (testing configuration)
3. Session data is stored in localStorage
4. Session monitoring begins

### Session Monitoring
The system continuously monitors sessions:
- **Every minute**: Checks if session is still valid
- **On user activity**: Resets auto-refresh timer
- **30 seconds before expiration**: Shows warning banner (testing configuration)
- **At expiration**: Automatically logs out user

### Session Refresh
Sessions can be refreshed in several ways:
1. **Manual refresh**: User clicks "Refresh Session" button
2. **Auto-refresh**: After 30 minutes of inactivity (if session is still valid)
3. **Page reload**: Refreshing the page can extend the session

## Components

### SessionTimeout
- Displays session countdown timer in navigation
- Shows session status and remaining time
- Located in the top navigation bar

### SessionWarning
- Prominent warning banner when session is expiring
- Appears 30 seconds before expiration (testing configuration)
- Provides options to refresh session or logout
- Fixed position at top of page

### SessionTest
- Testing page to demonstrate session functionality
- Shows detailed session information
- Allows manual session refresh
- Accessible at `/session-test`

## Configuration

### Session Duration
- **Testing**: 1 minute (1 * 60 * 1000 milliseconds)
- **Production**: 24 hours (24 * 60 * 60 * 1000 milliseconds)
- **Warning threshold**: 30 seconds before expiration (testing)
- **Auto-refresh threshold**: 30 minutes of inactivity

### Monitoring Intervals
- **Session check**: Every 60 seconds
- **Activity monitoring**: Continuous (mouse, keyboard, touch events)

## User Interface

### Navigation Bar
- Session timer displayed on the right side
- Shows remaining time in MM:SS format (testing)
- Hidden on mobile devices for space efficiency

### Warning Banner
- Orange warning banner appears when session is expiring
- Fixed position below navigation bar
- Includes refresh and logout buttons
- Auto-hides when session is refreshed or expires

### Session Test Page
- Accessible via "Session Test" navigation link
- Shows detailed session information
- Demonstrates all session timeout features
- Useful for testing and debugging

## Testing Configuration

### Current Settings (for testing)
- **Session timeout**: 1 minute
- **Warning threshold**: 30 seconds
- **Auto-refresh**: Disabled for short sessions
- **Monitoring**: Every 60 seconds

### Production Settings
- **Session timeout**: 24 hours
- **Warning threshold**: 5 minutes
- **Auto-refresh**: 30 minutes of inactivity
- **Monitoring**: Every 60 seconds

## Best Practices

### For Users
1. **Save work frequently**: Don't wait until session warning appears
2. **Use refresh button**: Extend session when needed
3. **Plan ahead**: Be aware of session expiration times
4. **Logout manually**: Use logout button when done

### For Developers
1. **Test session flows**: Use SessionTest component
2. **Handle expired sessions**: Always check authentication state
3. **User experience**: Provide clear feedback about session status
4. **Security**: Never bypass session validation

## Troubleshooting

### Common Issues

#### Session Expires Too Quickly
- Check if user's device time is correct
- Verify localStorage is working properly
- Check for JavaScript errors in console
- **Note**: Current testing configuration expires sessions after 1 minute

#### Warning Not Appearing
- Ensure SessionWarning component is imported
- Check if sessionTimeRemaining is being set
- Verify useEffect dependencies are correct
- **Note**: Warning appears 30 seconds before expiration in testing mode

#### Auto-refresh Not Working
- Check user activity event listeners
- Verify refreshSession function is working
- Check for errors in activity monitoring
- **Note**: Auto-refresh is disabled for 1-minute testing sessions

### Debug Information
- Use SessionTest page to view session details
- Check browser console for error messages
- Verify localStorage contains valid session data
- Test with different session expiration times

## Future Enhancements

### Planned Features
- **Configurable timeouts**: Allow admins to set custom session durations
- **Remember me**: Option to extend sessions for trusted devices
- **Session analytics**: Track session usage patterns
- **Multi-device support**: Handle sessions across multiple devices

### Technical Improvements
- **WebSocket integration**: Real-time session updates
- **Server-side validation**: Additional security layer
- **Session encryption**: Enhanced security for session data
- **Performance optimization**: Reduce monitoring overhead

## Security Considerations

### Session Security
- Sessions are stored in localStorage (consider httpOnly cookies for production)
- Session data includes user ID and expiration time
- Automatic cleanup of expired sessions
- No sensitive data stored in session

### Access Control
- All protected routes validate session before rendering
- Expired sessions immediately redirect to login
- No bypass mechanisms for expired sessions
- Secure logout clears all session data

## Testing

### Manual Testing
1. Login to the application
2. Navigate to Session Test page
3. Monitor session countdown timer (should show ~1 minute)
4. Wait for warning to appear (at 30 seconds remaining)
5. Test refresh and logout functionality

### Automated Testing
- Unit tests for session validation logic
- Integration tests for protected routes
- E2E tests for complete session flow
- Performance tests for monitoring overhead

## Support

For issues or questions about the session timeout system:
1. Check this documentation first
2. Use the SessionTest page for debugging
3. Review browser console for error messages
4. Contact development team for technical support

## Note for Production

**IMPORTANT**: Before deploying to production, change the session timeout back to 24 hours by modifying:
- `src/services/authApi.ts` - Change `1 * 60 * 1000` to `24 * 60 * 60 * 1000`
- `src/contexts/AuthContext.tsx` - Change `30 * 1000` to `5 * 60 * 1000`
- `src/components/SessionTimeout.tsx` - Change `30 * 1000` to `5 * 60 * 1000`
- `src/components/SessionWarning.tsx` - Change `30 * 1000` to `5 * 60 * 1000` 