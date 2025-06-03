// utils/googleSheetsAuth.js
import { SignJWT } from 'jose';

// Your service account credentials (DO NOT expose these in production!)
const SERVICE_ACCOUNT = {
  "type": "service_account",
  "project_id": "cool-lambda-354805",
  "private_key_id": "c2641653732dbd472d1620096fb40504938ac701",
  "private_key": `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCrzSvxSMc6ozcN
JjYCIJaGhlckYu3apP9LtSIglxGhPOJfJFy5h2AjTZGO0R1z54VuM+VwznCED01y
o5WnoT3oqo7LtgdA8Xx2HUOZMhKtPx+7Cr2lWjSdQZ7Z48/5P2nkKtAlkonToM/F
CynCSB9hTy9cPo1YpJEyl0BRy55J1CGcVx9Sh/XQfShfizjPJok8ofBANqKiaGmZ
AY5ICuiiX96YjFsbGvnvJYKqhSRWDYfJlVu77qNrplLb4PbCXpjek4dfEH3NVY5A
lWIKz1lZhfC7cytdq/eFxbVtYiB1hf737V8h42VUxGQVwSmkXw9ZubHBaizcR5Q/
t4MauqvTAgMBAAECggEAAaLy7RtXhjDUFQkI8N/9hGotFd4H/y38KEWd+oDUQKZ0
g7qgjy8NEknWyyTxAlf4A33umdAn3fgfczqLbry1d6wkw08iqZQ/NPuYlfEgI/VD
FCRZkDk6s1UXvb5SzN324Em2X1yi4mQkJh24kV5pvX7DejDhUrrrGLMEmpNF1ypW
GkWtglHrYkD7b0eXXelJXHIyyGak5xGjgvdNZqTmbjxwuiJFWi5tQnFFuKhbG+ui
zpSLy/3iN+2MbvjlGmHNyE1I+ieWSiM4QDsdgdrWY8rlqNwnEXTD6pmMojjRvo2r
yAE1VO06iOhiojaokc3lZ9L7dDbBLwYFR6o+co/JcQKBgQDkeCgeYaed0oyv3rH0
rB1UaTOVKGqxYpPOXsDJWeyTHlB6/PH3SEtP0V/O0pOssaV17TQB5wqtG7b55rTT
P11hrfPzILo5uNqJy+4fsvXFJe4FMsobzi3YmsHBkp2WImwqeojcKJUemh2Wex5g
BcUNic/Uk8W5YeYi3TZxdCdlawKBgQDAgOsNmfnQ5E/x+g0EWUajCMt2uLS06xeB
GmAUHekGlEN2UdqtSFb/Fg6mJo+j4TDqpa9/sfHUMiXaueSTpFfB2xHPtnd6cB34
xJJ8BImpdMWOtH0jl/j/9d1k7Z0M9qIOpIA3Zv78QtPzqdCdf+WrI5Z2pKf9PLvO
tynd724FOQKBgEHGpiY5DzzMxVxMzQcYFkmbEBK9VBpFuzAK744IqaehbqI5+J+s
3KHaMa8lyQZLDsvowrRZhCVaeU9xMFYxQ/0/S6CPp42+vow1fhT6PO/Jf8FXYgCn
V2OpCmdkgqIavvFr3cMkm+n3jNUqFRCoGJdROdiFwsMggFVBQs9fFYiJAoGACj+S
w/GblBxjiS1XvhCGqy1Pr61bqXoOkUf3L3r8KeaAxO7MpocAYqoo832ADihx8zwI
4NJ3XmWhEEjvO1D3fxGLnDRJnhIT9md4qPOQ5J2b2uIO+3MexXmwZKwlvUfwDrmB
PfHUx1dDc2hp+8iQUJEfdIeFjfzKvtGPgAo8IDkCgYAMxnnmd+Z1b+OWl+Fnvdze
iNiBd86qHdV+dkCunBZkFu0T4Wy5iP2DQlClaUw3kuJblKv2bg5OGGaHfgRvm6nV
RXMP4ANeCRAirfA3Ya9qObkJ+Q/9XB5oMnD/sjuwrCvOo5R1NKyhNDVoldp8pd1O
zwXiU4q6+YcQrjUbHMqpnA== 
-----END PRIVATE KEY-----`,
  "client_email": "inventory@cool-lambda-354805.iam.gserviceaccount.com",
  "client_id": "105629799353489943653",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/inventory%40cool-lambda-354805.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

export async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // Token valid for 1 hour
  // Create and sign the JWT
  const jwt = await new SignJWT({ scope: "https://www.googleapis.com/auth/spreadsheets" })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setIssuer(SERVICE_ACCOUNT.client_email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setExpirationTime(exp)
    .sign(new TextEncoder().encode(SERVICE_ACCOUNT.private_key));

  // Exchange the JWT for an access token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await response.json();
  return tokenData.access_token;
}
