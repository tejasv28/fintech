

async function test() {
  try {
    const loginRes = await fetch('http://127.0.0.1:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john.doe@email.com', password: 'John@123' })
    });
    const loginData = await loginRes.json();
    console.log('Login token:', loginData.token);

    const appsRes = await fetch('http://127.0.0.1:8080/api/loans/my-applications', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    if (!appsRes.ok) {
        console.error('Apps error status:', appsRes.status);
        console.error('Apps error body:', await appsRes.text());
        return;
    }
    const appsData = await appsRes.json();
    console.log('My Applications:', appsData);
  } catch (err) {
    console.error(err);
  }
}

test();
