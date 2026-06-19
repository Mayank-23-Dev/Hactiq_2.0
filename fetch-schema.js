async function main() {
  const url = "https://cjqjwgqmbwmztwylrpep.supabase.co/rest/v1/";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqcWp3Z3FtYndtenR3eWxycGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MjQ2MDksImV4cCI6MjA5NzMwMDYwOX0.iso8LoqAzaSxKi0Se8_Q0iSobg5WI0agYe-e5-zFKmM";
  try {
    const res = await fetch(url, { headers: { apikey: key } });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.error(err);
  }
}
main();
