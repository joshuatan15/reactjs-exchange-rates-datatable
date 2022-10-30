import React from "react";
import Table from "./component/table.js";
import { QueryClient, QueryClientProvider } from "react-query";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Table></Table>
      </div>
    </QueryClientProvider>
  );
}

export default App;
