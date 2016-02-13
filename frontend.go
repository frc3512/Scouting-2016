package main;

import "dispatcher"
import "net/http"
//import _ "github.com/mattn/go-sqlite3"
//import "database/sql"
import "log"
/* import "time" */
import "fmt"
import "bytes"
import "encoding/json"
import "strconv"
import "os"
import "encoding/csv"

var g_version string;

type ReceiveMessageHandle struct {
  //database *sql.DB;
  columns []string;
  file *os.File;
};

func valueToString(in interface{}) string {
            switch t := in.(type) {
            default:
                return "nil";
            case string:
                return t;
            case int:
                return strconv.FormatInt(int64(t), 10);
            case int64:
                return strconv.FormatInt(t, 10);
            case float64:
                return strconv.FormatFloat(t, 'f', 6, 64);
            case bool:
                if t == true {
                    return "true";
                }else{
                    return "false";
                }
            }
}

func decodeData(jsontext string) (out []map[string]string, ok bool){
    var strarr []interface{};

    err := json.Unmarshal(bytes.NewBufferString(jsontext).Bytes(), &strarr);
    if err != nil {
		fmt.Println("error:", err)
        return nil, false;
	}

    if(strarr[0] == "magic v0.2") {
        //var record []string;


        for i := 1; i < len(strarr); i++ {
            outmap := make(map[string]string);
            m, isok := strarr[i].(map[string]interface{});
            if(!isok) {
                // All of these should work
                return nil, false;
            }

            for key, value := range m {
                //fmt.Println(key + ", " + valueToString(value));
                outmap[key] = valueToString(value);
            }
            out = append(out, outmap);
        }

    }

    return out, true;
}

func writeCsvRecords(wr *os.File, columns []string, records []map[string]string) (ok bool) {
    csvwrite := csv.NewWriter(wr);

    // Loop over the records
    for _, record := range records {
        // Find the keys we're using
        outslice := make([]string, len(columns));
        for i, keyname := range columns {
            col, ok := record[keyname];
            if(ok) {
                outslice[i] = col;
            } else {
                outslice[i] = "nil";
            }
        }
        csvwrite.Write(outslice);
    }

    csvwrite.Flush();

    if(csvwrite.Error() != nil) {
        return false;
    }
    return true;
}

func (wh ReceiveMessageHandle) ServeHTTP(wr http.ResponseWriter, req *http.Request) {
  /* message = req.FormValue("message");
  from = req.FormValue("from");
  to = req.FormValue("to");
  timestamp = time.Now(); */

  //wr.Header().Add("Content-Type", "text/html");
  /* wr.Header().Add("Access-Control-Allow-Origin", "http://scoutdb.frc3512.com");
  wr.Header().Add("Access-Control-Allow-Headers", "Content-Type"); */
  wr.WriteHeader(200);

  buf := new(bytes.Buffer);
  buf.ReadFrom(req.Body);
  s := buf.String();

  records, ok := decodeData(s);
  if(!ok) {
    fmt.Fprintln(wr, "Failed");
    return;
  }

  ok = writeCsvRecords(wh.file, wh.columns, records);
  if(!ok) {
      fmt.Fprintln(wr, "Failed");
      return;
  }

  fmt.Fprintln(wr, "OK");
  return;

  fmt.Fprintln(wr, "Failed");
}

func formHandle(wr http.ResponseWriter, req *http.Request) {
    http.ServeFile(wr, req, "html/scouting-form.html");
}

func versionHandle(wr http.ResponseWriter, req *http.Request) {
    wr.Header().Add("Content-Type", "text/javascript");
    wr.WriteHeader(200);

    fmt.Fprintln(wr, "var g_versionString = '" + g_version + "';");
}

func csvHandle(wr http.ResponseWriter, req *http.Request) {
    http.ServeFile(wr, req, "output.csv");
}

func mainHandle(wr http.ResponseWriter, req *http.Request) {
    http.ServeFile(wr, req, "html/index.html");
}

func main() {
  var d *dispatcher.Dispatcher;

  /* Initialize the database */
  //db, err := sql.Open("sqlite3", "scouting.db");
  //if(err != nil) {
  //  log.Fatal(err);
  //}
  //defer db.Close();

  fmt.Println("Version: " + g_version);

  // Open the file
  file, err := os.OpenFile("output.csv", os.O_RDWR | os.O_APPEND, 0660);
  if(err != nil) {
    fmt.Println(err);
    return;
  }
  defer file.Close();

  // Write the list of columns to the CSV file
  /* columns := []string{"timestamp", "f_matchNumber", "f_teamNumber", "f_numAutoZone", "f_numStageBin", "f_numStepBin", "f_robotAuton", "f_toteAuton", "f_numOnStep", "f_numOnTop", "f_fouls", "f_stacks", "f_dead", "f_tipped", "f_tippedOtherRobot", "f_morePlayerStation", "f_notes"}

  for i := 1; i < 5; i++ {
    columns = append(columns, "f_" + strconv.Itoa(i) + "_litter");
    columns = append(columns, "f_" + strconv.Itoa(i) + "_can");
    columns = append(columns, "f_" + strconv.Itoa(i) + "_ntotes");
  }
  writer := csv.NewWriter(file);
  writer.Write(columns);
  writer.Flush(); */

  // Create our list of columns from the first line of the CSV file
  reader := csv.NewReader(file);
  columns, err := reader.Read();
  if(err != nil) {
      fmt.Println(err);
      return;
  }

  // Seek to the end so we can begin writing
  file.Seek(0, 2);

  msgHandle := new(ReceiveMessageHandle);
  msgHandle.columns = columns;
  msgHandle.file = file;
  //msgHandle.database = db;

  /* Initialize the HTTP server */
  d = dispatcher.NewDispatcher();
  d.RegisterExpr("^/$", http.HandlerFunc(mainHandle));
  d.RegisterExpr("^/form$", http.HandlerFunc(formHandle));
  d.RegisterExpr("^/version.js$", http.HandlerFunc(versionHandle));
  d.RegisterExpr("^/output.csv$", http.HandlerFunc(csvHandle));
  d.RegisterExpr("^/write$", http.StripPrefix("/", msgHandle));
  d.RegisterExpr("^/res", http.StripPrefix("/res/", http.FileServer(http.Dir("html/res/"))));

  log.Fatal(http.ListenAndServe("127.0.0.1:8088", d))
}
