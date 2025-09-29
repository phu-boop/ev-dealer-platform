import { GoogleLogin } from '@react-oauth/google';

function LoginButton({ onLoginSuccess }) {
  return (
    <GoogleLogin
      onSuccess={credentialResponse => {
        console.log('Google credential', credentialResponse);
        // gửi token về backend
        fetch('http://localhost:8080/oauth2/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: credentialResponse.credential })
        })
        .then(res => res.json())
        .then(data => {
          // lưu JWT hoặc thông tin user
          localStorage.setItem('token', data.token);
          onLoginSuccess(data);
        });
      }}
      onError={() => {
        console.log('Login Failed');
      }}
    />
  );
}
