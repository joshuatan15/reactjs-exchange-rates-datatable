import React, { useState, useEffect, useMemo } from "react";
import DataTable, { createTheme } from "react-data-table-component";
import Button from "./shared/Button";
import FilterComponent from "./shared/FilterComponent";
import "./styles.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

function App() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    fetch(`https://api.coingecko.com/api/v3/exchange_rates`)
      .then((res) => res.json())
      .then(
        (result) => {
          var array = Object.keys(result.rates).map((key) => result.rates[key]);
          setIsLoaded(true);
          setAllItems(array);
          setTotalRows(array.length);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
          notifyFailed(error.message);
        }
      );
  };

  const handlePageChange = (page) => {
    fetchData(page, perPage);
    scrollToTop();
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
    scrollToTop();
  };

  const notifySuccess = (message) => toast.success(message);
  const notifyFailed = (message) => toast.error(message);
  const notifyInfo = (message) => toast.info(message);

  const filteredItems = allItems.filter(
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

  function convertArrayOfObjectsToCSV(data) {
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

  function downloadCSV(data) {
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

  const actionsMemo = React.useMemo(
    () => <Export onExport={() => downloadCSV(allItems)} />,
    [allItems]
  );

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
        paginationTotalRows={totalRows}
        paginationComponentOptions={paginationComponentOptions}
        paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page
        paginationRowsPerPageOptions={[5, 10, 25, 50]}
        // onChangePage={handlePageChange}
        // onChangeRowsPerPage={handlePerRowsChange}
        actions={actionsMemo}
        persistTableHead
        fixedHeader
        progressPending={!isLoaded}
        striped
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        // theme="solarized"
      />
    </div>
  );
}

export default App;
