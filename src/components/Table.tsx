import { Row } from "../types/@types";

interface TableProps {
  headings: string[];
  data: any[];
  loading: boolean;
  error: string | null;
}

const Table: React.FC<TableProps> = ({ headings, data, loading, error }) => {
  if (error) {
    return <p className="label error">{error}</p>;
  }

  if (!data.length) {
    return <p className="label">Upload a file to get started</p>;
  }

  if (loading) {
    return <div className="loader"></div>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {headings.map((heading: string, idx) => (
              <th key={`heading-${idx}`}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: Row, idx) => (
            <tr key={`row-${row.EmpID1}-${row.EmpID2}-${idx}`}>
              <td>{row.EmpID1}</td>
              <td>{row.EmpID2}</td>
              <td>{row.ProjectID}</td>
              <td>{row.DaysWorked}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
