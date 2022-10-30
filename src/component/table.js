import React, { useState, useMemo } from "react";
import DataTable, { createTheme } from "react-data-table-component";
import Button from "../shared/Button";
import FilterComponent from "../shared/FilterComponent";
import "../styles.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery } from "react-query";

createTheme(
  "solarized",
  {
    text: {
      primary: "#268bd2",
      secondary: "#2aa198",
    },
    background: {
      default: "#002b36",
    },
    context: {
      background: "#cb4b16",
      text: "#FFFFFF",
    },
    divider: {
      default: "#073642",
    },
    action: {
      button: "rgba(0,0,0,.54)",
      hover: "rgba(0,0,0,.08)",
      disabled: "rgba(0,0,0,.12)",
    },
  },
  "dark"
);

const columns = [
  {
    name: "Name",
    id: "name",
    selector: (row) => row.name,
    grow: 6,
    sortable: true,
    reorder: true,
  },
  {
    name: "Type",
    id: "type",
    selector: (row) => row.type,
    grow: 2,
    sortable: true,
    reorder: true,
  },
  {
    name: "Unit",
    id: "unit",
    selector: (row) => row.unit,
    grow: 2,
    sortable: true,
    reorder: true,
  },
  {
    name: "Value",
    id: "value",
    selector: (row) => row.value,
    grow: 2,
    sortable: true,
    reorder: true,
    right: true,
  },
];

function Table() {
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const notifyFailed = (message) => toast.error(message);
  const notifyInfo = (message) => toast.info(message);

  const { data, isLoading, error } = useQuery("data", () => {
    return fetch(`https://api.coingecko.com/api/v3/exchange_rates`).then(
      (res) => res.json()
    );
  });

  const mutatedData = (() => {
    if (data) {
      let array = Object.keys(data.rates).map((key) => data.rates[key]);
      return array;
    }
    return [];
  })();

  if (error) notifyFailed(error.message);

  const handlePageChange = (page) => {
    scrollToTop();
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    scrollToTop();
  };

  const filteredItems = mutatedData.filter(
    (item) =>
      item.name && item.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };

    return (
      <FilterComponent
        onFilter={(e) => setFilterText(e.target.value)}
        onClear={handleClear}
        filterText={filterText}
      />
    );
  }, [filterText, resetPaginationToggle]);

  const paginationComponentOptions = {
    selectAllRowsItem: true,
    selectAllRowsItemText: "ALL",
  };

  const convertArrayOfObjectsToCSV = (data) => {
    let result;

    const columnDelimiter = ",";
    const lineDelimiter = "\n";
    const keys = Object.keys(data[0]);

    result = "";
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach((item) => {
      let ctr = 0;
      keys.forEach((key) => {
        if (ctr > 0) result += columnDelimiter;

        result += item[key];
        // eslint-disable-next-line no-plusplus
        ctr++;
      });
      result += lineDelimiter;
    });

    return result;
  }

  const Export = ({ onExport }) => (
    <Button
      id="export"
      text="Export as CSV"
      icon="fa fa-download"
      onClick={(e) => onExport(e.target.value)}
    ></Button>
  );

  const scrollToTop = () => {
    var tableElement = document.getElementsByClassName("rdt_Table")[0];
    tableElement.scrollIntoView({ behavior: "smooth" });
  };

  const actionsMemo = useMemo(() => {
    const downloadCSV = (data) => {
      notifyInfo("Exporting CSV...");
      const link = document.createElement("a");
      let csv = convertArrayOfObjectsToCSV(data);
      if (csv == null) return;

      const filename = "export.csv";

      if (!csv.match(/^data:text\/csv/i)) {
        csv = `data:text/csv;charset=utf-8,${csv}`;
      }
      link.setAttribute("href", encodeURI(csv));
      link.setAttribute("download", filename);
      link.click();
    };
    return <Export onExport={() => downloadCSV(mutatedData)} />;
  }, [mutatedData]);

  return (
    <div className="App">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        limit={1}
        pauseOnHover
        theme="colored"
      />
      <DataTable
        title="Rates"
        columns={columns}
        data={filteredItems}
        defaultSortFieldId="name"
        pagination
        // paginationServer
        paginationTotalRows={mutatedData.length}
        paginationComponentOptions={paginationComponentOptions}
        paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page
        paginationRowsPerPageOptions={[5, 10, 25, 50]}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}
        actions={actionsMemo}
        persistTableHead
        fixedHeader
        progressPending={isLoading}
        striped
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        // theme="solarized"
      />
    </div>
  );
}

export default Table;
