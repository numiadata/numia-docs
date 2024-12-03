import React, { useState } from "react";
import "./styles.css";
import Heading from "@theme/Heading";

function TableDetail({ table }) {
  return (
    <div>
      <p>{table.description}</p>
      <table>
        <thead>
          <tr>
            <th>Column Name</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {table.columns.map((column) => (
            <tr key={column.name}>
              <td>{column.name}</td>
              <td>{column.type}</td>
              <td>{column.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tabs({ tables }) {
  const [activeTab, setActiveTab] = useState(tables[0].name);

  return (
    <div className="tabsContainer">
      <div className="tabButtons">
        {tables.map((table) => (
          <button
            key={table.name}
            className={
              activeTab === table.name ? "tabButton activeTab" : "tabButton"
            }
            onClick={() => setActiveTab(table.name)}
          >
            {table.name}
          </button>
        ))}
      </div>
      <div className="tabContent">
        {tables.map((table) =>
          activeTab === table.name ? (
            <TableDetail key={table.name} table={table} />
          ) : null
        )}
      </div>
    </div>
  );
}

function TablesByTag({ data, tag }) {
  const filteredTables = data.tables.filter((table) =>
    table.tags.includes(tag)
  );

  if (filteredTables.length === 0) {
    return <div>No tables found with tag "{tag}".</div>;
  }

  return (
    <>
      <Tabs tables={filteredTables} />
    </>
  );
}

export default TablesByTag;