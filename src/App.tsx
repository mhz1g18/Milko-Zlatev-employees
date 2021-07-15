import { useState } from "react";
import axios from "axios";
import "./App.css";
import { Row } from "./types/@types";
import Table from "./components/Table";
import FileUploader from "./components/FileUploader";

const tableHeadings = [
  "Employee ID #1",
  "Employee ID #2",
  "Project ID",
  "Days Worked",
];

const App = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function onFileUpload(file: File) {
    const bodyFormData = new FormData();
    bodyFormData.append("file", file);

    setLoading(true);

    try {
      const response = await axios({
        method: "POST",
        url: "http://localhost:3001/upload",
        data: bodyFormData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.status);
      console.log(response.data);

      setData(response.data.rows);
      setError(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error.response.data);
      setError(error.response.data.error);
    }
  }

  return (
    <div className="App">
      <div className="header">
        <FileUploader onUpload={onFileUpload} />
      </div>
      <Table
        headings={tableHeadings}
        data={data}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default App;
