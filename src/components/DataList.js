import React from "react";

const DataList = ({ data, deleteData }) => {
  return (
    <ul>
      {data.map((item, index) => (
        <li key={index}>
          {item.name}: {item.value}
          <button onClick={() => deleteData(index)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};

export default DataList;
