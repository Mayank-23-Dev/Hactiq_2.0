async function fetchWithRetry(url, retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (err) {
      console.log(`Retry ${i + 1}/${retries} failed...`);
    }
    await new Promise(r => setTimeout(r, delay));
  }
  throw new Error("Failed to fetch after all retries");
}

async function main() {
  try {
    const targets = await fetchWithRetry("http://127.0.0.1:9222/json");
    console.log("Targets found:", targets.map(t => ({ url: t.url, type: t.type })));
    
    const target = targets.find(t => t.url.includes("localhost:5173") || t.url.includes("hactiq") || t.type === "page");
    if (!target) {
      console.log("No page target found.");
      return;
    }
    
    console.log("Connecting to target:", target.webSocketDebuggerUrl);
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    
    ws.onopen = () => {
      console.log("Connected to WebSocket");
      ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
      ws.send(JSON.stringify({ id: 2, method: "Console.enable" }));
      ws.send(JSON.stringify({ id: 3, method: "Log.enable" }));
    };
    
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === "Runtime.consoleAPICalled") {
        const args = msg.params.args.map(a => a.value || JSON.stringify(a));
        console.log(`[Console ${msg.params.type}]:`, ...args);
      } else if (msg.method === "Log.entryAdded") {
        console.log(`[Log ${msg.params.entry.level}]:`, msg.params.entry.text);
      } else if (msg.method === "Runtime.exceptionThrown") {
        console.error("[Exception]:", msg.params.exceptionDetails.exception.description);
      }
    };
    
    ws.onerror = (err) => {
      console.error("WS Error:", err);
    };
    
    ws.onclose = () => {
      console.log("WS Closed");
    };
    
    await new Promise(r => setTimeout(r, 10000));
    ws.close();
  } catch (err) {
    console.error("Error:", err.message);
  }
}
main();
