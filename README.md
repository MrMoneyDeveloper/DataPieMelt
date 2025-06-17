# DataPieMelt

Unified React + Node + Python/R Code Execution
Platform
This project integrates a React single-page app (SPA) with a Node.js (Express) backend, and uses Python
and R scripts for executing operations. It allows users to trigger operations (with default or custom
parameters), and view step-by-step execution traces (showing control flow, variable values, and any
errors) as well as final results (including visual outputs from R). The entire system can be run with one
command in development using concurrently, and follows a clear folder structure for frontend, backend,
scripts, logs, and assets.
Project Structure
Below is the proposed folder structure for the unified codebase, with each component organized for clarity:
project-root/
├── package.json # Root NPM package (runs concurrently for fullstack
dev)
├── README.md # Documentation for setup and usage
├── frontend/ # React frontend application
│ ├── package.json # React app dependencies (e.g. react, etc.)
│ ├── public/
│ │ └── index.html # HTML template for React
│ └── src/
│ ├── App.js # Main React component (UI for triggering ops and
displaying results)
│ └── components/ # Additional UI components (if any)
├── backend/ # Node.js backend (Express server)
│ ├── package.json # Backend dependencies (express, winston, etc.)
│ ├── server.js # Express app initialization and routes
│ ├── routes/ # (Optional) Express route modules
│ │ └── operations.js # Route handler for operation requests (if
separated)
│ ├── scripts/ # Directory for operation scripts in Python and R
│ │ ├── python/
│ │ │ └── factorial_trace.py # Sample Python script with trace logging
│ │ └── r/
│ │ └── plot_data.R # Sample R script for data transform &
plotting
│ ├── logs/
│ │ └── app.log # Log file for backend (structured logs via
Winston)
1
│ └── output/ # Output files (e.g. generated plot images)
│ └── plot_output.png # Example output image from R script
└── ... (any other config files, e.g., .gitignore, .env for secrets/ports if
needed)
Key Directories:
frontend/: Contains the React app (could be bootstrapped with Create React App). It provides a UI
for users to select operations, input parameters, and view execution traces and results.
backend/: Contains the Node.js Express server code. This handles API requests from the frontend,
dispatches tasks to Python/R, and returns results/logs. It also configures logging (using Winston)
and error handling.
backend/scripts/: Holds the Python and R scripts that actually perform the operations. Organized
by language for clarity.
backend/logs/: Stores log files (e.g. app.log ) with structured logs from the Node server (requests,
errors, etc.).
backend/output/: Stores any generated output files (for example, images produced by R scripts)
that can be served to the frontend for visualization.
root package.json: Defines a concurrent startup script to run both the backend and frontend (and
any watchers) with one command.
Frontend (React SPA)
The React frontend provides a simple interface to trigger operations and display the step-by-step execution
logs and results. It might consist of a main component (e.g. App.js ) and a couple of input or display
components. Key features of the UI:
Buttons or forms to trigger default or parameterized operations (e.g. a button to compute a
factorial of a given number, or to generate a plot with a certain dataset size).
A display area for step-by-step trace logs of code execution. This can be a scrollable list of log lines,
updating as the backend returns them.
An area to show the result of the operation – which could be a numeric result, a success message, or
an image/visualization (for R plotting operations).
Basic error handling in the UI (displaying error messages if the backend returns an error).
Example UI Flow: The user enters a number (or uses a default), clicks "Run Factorial". The app calls the
backend API to execute the factorial operation. While waiting, it could show a loading indicator. When the
response arrives, the UI shows the returned logs line by line (to illustrate the code execution flow) and the
final result (e.g. the factorial value). Another button "Generate Plot" could trigger an R script, then display
the resulting image along with any trace or logs from that script.
Key Frontend Code Snippets:
In frontend/src/App.js (assuming a functional component with hooks for state):
•
•
•
•
•
•
•
•
•
•
2
import React, { useState } from 'react';
function App() {
const [logs, setLogs] = useState([]); // Trace logs from backend
const [result, setResult] = useState(null); // Result (numeric or status
message)
const [plotUrl, setPlotUrl] = useState(null); // URL of generated plot image
(for R operations)
// Example: Trigger factorial operation with a given number
const runFactorial = async (n) => {
setLogs([]); setResult(null); setPlotUrl(null);
try {
const response = await fetch('/api/run', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ op: 'factorial', param: n })
});
const data = await response.json();
if (!data.success) {
setLogs(data.logs || []);
setResult(`Error: ${data.error}`); // Show error message
} else {
setLogs(data.logs);
if (data.result !== undefined) setResult(`Result = ${data.result}`);
}
} catch (err) {
setResult('Error connecting to server.');
}
};
// Example: Trigger plot generation operation
const runPlot = async (points = 50) => {
setLogs([]); setResult(null); setPlotUrl(null);
try {
const response = await fetch('/api/run', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ op: 'plot', param: points })
});
const data = await response.json();
if (!data.success) {
setLogs(data.logs || []);
setResult(`Error: ${data.error}`);
} else {
setLogs(data.logs);
if (data.plotUrl) {
3
setPlotUrl(data.plotUrl); // e.g. "/output/plot_output.png"
setResult('Plot generated successfully');
}
}
} catch (err) {
setResult('Error connecting to server.');
}
};
return (
<div className="App">
<h1>Code Execution Demo</h1>
{/* Input and buttons to trigger operations */}
<div>
<input type="number" id="factorialInput" defaultValue={5} />
<button onClick={() => {
const n = document.getElementById('factorialInput').value;
runFactorial(Number(n));
}}>
Run Factorial
</button>
</div>
<div>
<button onClick={() => runPlot(100)}>Generate Plot (100 points)</button>
</div>
{/* Result display */}
{result && <div className="result">{result}</div>}
{/* Plot display (if available) */}
{plotUrl && <div><img src={plotUrl} alt="Generated Plot" /></div>}
{/* Execution trace logs */}
{logs.length > 0 && (
<div className="logs">
<h3>Execution Trace:</h3>
<ul>
{logs.map((line, idx) => <li key={idx}>{line}</li>)}
</ul>
</div>
)}
</div>
);
}
export default App;
4
Notes: - In development, to simplify API calls, we can set the React dev server to proxy API requests to the
Node server (e.g., add "proxy": "http://localhost:5000", in frontend/package.json to
forward /api/* calls to the backend ). This avoids CORS issues during development. - In production
(after building the React app), the static files can be served by Express (e.g. by using express.static on
the React build directory), but during development we use two servers (React on port 3000, Node on 5000). -
The UI code above uses the Fetch API for simplicity. In a larger project, you might use Axios for requests or
manage state with a framework, but the above is sufficient to illustrate the approach.
Backend (Node.js & Express API)
The Node.js backend is an Express server that exposes an API endpoint (e.g. POST /api/run ) to handle
operation requests from the frontend. It is responsible for deciding which language (Python or R) should
execute the requested operation, invoking the corresponding script, and returning the results and logs back
to the client. It also implements structured logging using Winston (logging important events to both
console and a file), and includes error handling so that any failures in the scripts or calls are caught and
reported.
Key backend features:
Express app setup: uses JSON body parsing ( express.json() or body-parser ) to accept JSON
payloads from the React app.
Routing: a route (e.g. /api/run ) accepts a JSON body like { op: "factorial", param: 5 }
or { op: "plot", param: 100 } . Depending on the op field, it will trigger the appropriate
script.
Script invocation: uses Node’s child_process module (e.g. spawn or exec ) to call external
scripts. For Python operations (like factorial or other algorithmic tasks), it calls a Python interpreter
on the corresponding .py file. For R operations (like data plotting), it calls R’s command-line (e.g.
Rscript ) on the .R file. The backend collects stdout/stderr from these scripts.
Structured logging: uses Winston to log events. For example, when a request is received, log an
info level entry with the operation type and parameters. If an error occurs (script fails, etc.), log an
error with details. The Winston logger can be configured with multiple transports; here we at least
use a file transport to write to logs/app.log (and optionally also console). The log format can be
JSON or plain text with timestamps – Winston supports flexible formats. In this setup, each log entry
includes level and message (and could include timestamps or metadata if configured).
Static file serving: the backend can serve the output directory (e.g. backend/output ) as static
files so that generated images (plots) can be accessed by the frontend via a URL. For instance,
app.use('/output', express.static(path.join(__dirname, 'output'))) will allow the
frontend to request http://localhost:5000/output/plot_output.png and get the image.
Backend Code (server.js):
Below is a simplified version of the Express server ( backend/server.js ) highlighting the core
functionality:
const path = require('path');
const express = require('express');
1
•
•
•
•
•
5
const { exec } = require('child_process');
const winston = require('winston');
const app = express();
app.use(express.json());
// Configure Winston logger (log to file + console)
const logger = winston.createLogger({
level: 'info',
format: winston.format.simple(), // plain text for simplicity (could use
JSON)
transports: [
new winston.transports.File({ filename: path.join(__dirname, 'logs/
app.log') }),
new winston.transports.Console()
]
});
// Winston will create the file if not exists and append logs .
// Log entries will include level and message (in simple text format here).
// Serve static files from output directory (for plot images)
app.use('/output', express.static(path.join(__dirname, 'output')));
// API route to handle operation execution requests
app.post('/api/run', (req, res) => {
const { op, param } = req.body;
logger.info(`Received operation request: op=${op}, param=${param}`);
// Determine which script to run based on op
if (op === 'factorial') {
// Call Python script for factorial
const n = Number(param) || 0;
const pyScript = path.join(__dirname, 'scripts/python/factorial_trace.py');
exec(`python "${pyScript}" ${n}`, (error, stdout, stderr) => {
// Prepare logs and result
let logs = [];
let resultValue = null;
if (stdout) {
const outputLines = stdout.trim().split(/\r?\n/);
// If the last line is a pure number (result), separate it
const lastLine = outputLines[outputLines.length - 1];
if (lastLine.match(/^-?\\d+$/)) {
resultValue = parseInt(lastLine, 10);
outputLines.pop(); // remove the numeric result from logs
}
logs = outputLines;
}
if (error) {
2
6
// Script returned an error (non-zero exit code or execution failure)
logger.error(`Error running factorial script: ${error.message}`);
return res.json({ success: false, error: error.message, logs });
}
// Success: send back logs and result
logger.info(`Operation factorial completed, result=${resultValue}`);
return res.json({ success: true, logs, result: resultValue });
});
}
else if (op === 'plot') {
// Call R script for plotting
const points = Number(param) || 0;
const rScript = path.join(__dirname, 'scripts/r/plot_data.R');
exec(`Rscript "${rScript}" ${points}`, (error, stdout, stderr) => {
let logs = stdout ? stdout.trim().split(/\r?\n/) : [];
if (error) {
logger.error(`Error running plot script: ${error.message}`);
return res.json({ success: false, error: error.message, logs });
}
// If successful, the R script will save an image to 'output/
plot_output.png'
// We assume the image is generated. We can return the path for the
frontend.
logger.info('Operation plot completed, image generated');
return res.json({ success: true, logs, plotUrl: '/output/
plot_output.png' });
});
}
else {
// Unknown operation
logger.warn(`Unknown operation requested: ${op}`);
return res.status(400).json({ success: false, error: 'Unknown operation',
logs: [] });
}
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
logger.info(`Server listening on port ${PORT}`);
});
Explanation of the above backend code:
It sets up Winston to log to a file logs/app.log and also to the console. (In a real app, you might
configure different log levels for file vs console, add timestamps or JSON formatting, etc. For
•
7
demonstration this uses simple text logging. By default Winston’s simple format will just print level
and message.)
The Express route /api/run reads op and param from the request JSON. Depending on the
op value:
If op === 'factorial' : it builds a command to run the Python script factorial_trace.py
with the parameter (the number for factorial). The child_process.exec function is used to
execute the script. We capture stdout and stderr in the callback:
We split the stdout by lines. We check if the last line is purely digits (which in our Python script
design indicates the final result value). If so, we separate that as resultValue and remove
it from the logs array.
If there's an error object, it indicates the script exited with a non-zero status or failed to
start; we log the error via Winston and send a JSON { success: false, error: ...,
logs: ... } back to the client.
If no error, we log a success message and send { success: true, logs: [...],
result: <number> } .
If op === 'plot' : similarly, it runs the R script via Rscript . We gather stdout lines as logs. If
error, log and return failure. If success, we assume the R script saved an image file (in backend/
output/plot_output.png ). We return { success: true, logs: [...], plotUrl: '/
output/plot_output.png' } . The frontend can use this URL (which the Express static
middleware will serve) to display the image.
If op is not recognized, we log a warning and return a 400 response with an error message.
We start the server on port 5000 (which should match the proxy configured in the React app during
development).
Structured Logging (Winston): The use of Winston allows logs to be directed to multiple outputs. In the
snippet above, we configure a file transport (so all logs are appended to backend/logs/app.log ) and a
console transport (so during development you see logs in the terminal). The log messages are at levels info,
error, warn, etc., and could be in JSON or include timestamps if configured. For example, Winston file
logging is initialized simply with a filename, and it will automatically create and append to the log file :
const logger = winston.createLogger({
transports: [
new winston.transports.File({ filename: "app.log" }) // logs to app.log
file
],
});
Each call like logger.info("message") or logger.error("message") will produce an entry in
app.log . By using Winston, it's easy to later add features like log rotation or different log levels to
different files if needed.
Error Handling: The backend ensures that any error (from script execution or an unknown operation)
results in a JSON with success: false and an error message. This way the frontend can handle it
gracefully (e.g., display the error).
•
•
◦
◦
◦
•
•
•
2
8
Note on Python/R integration: In this design, Node calls Python and R via command-line. An alternative
approach would be to use a Python intermediate layer that calls R (for example using the rpy2 library to
call R from Python). In a more complex system, one might have Python handle both logic and calling R as
needed, or even run a Python service and R service separately. Here, for simplicity, we directly invoke each
as needed. The architecture is flexible; you could replace the direct Rscript call with a Python script that
uses rpy2 to run R code in-process. Using rpy2 allows running R within Python processes, effectively
letting you mix Python and R code and choose the best language for each task . (This project
demonstrates the command-line approach, but it's good to know such integration is possible.)
Python Scripts (Logic & Trace)
In the backend/scripts/python/ directory, we implement operations that are better suited to Python –
typically algorithmic tasks, control flow, or anything where we want to produce a step-by-step trace of
execution. Python is used here because it's easy to instrument and trace, and supports libraries for
introspection and debugging.
One example is a factorial computation with trace. This script will compute the factorial of a given
number n , but also print out each step of the computation (illustrating loop iterations and intermediate
values). We can also demonstrate conditional branching.
Filename: backend/scripts/python/factorial_trace.py :
import sys
# [Optional] You could use snoop for automated tracing:
# from snoop import snoop
# @snoop()
def compute_factorial(n):
"""Compute factorial of n with iterative approach, printing trace logs."""
if n < 0:
print(f"Error: factorial of negative number ({n}) is undefined.",
file=sys.stderr)
sys.exit(1) # exit with error code for negative input
result = 1
print(f"Starting factorial computation for n={n}")
# Loop from 1 to n, multiplying result each time and printing the state
for i in range(1, n + 1):
# Before multiplying, show the current state
print(f" Step {i}: result = {result} * {i}")
result *= i
print(f" -> Intermediate result after multiplying by {i} = {result}")
print(f"Factorial of {n} is {result}")
# Print just the result number on a separate line (for easy parsing by Node)
print(result)
# Entry point when script is called
3
9
if __name__ == "__main__":
# Read n from command-line arguments
try:
n = int(sys.argv[1]) if len(sys.argv) > 1 else 0
except ValueError:
print("Error: invalid integer input.", file=sys.stderr)
sys.exit(1)
compute_factorial(n)
Key points in this Python script: - It reads the input number n from sys.argv . If the input is not
provided or not an integer, it prints an error to stderr and exits with code 1. - If n is negative, it prints an
error message to stderr and exits with a non-zero code (so the Node process knows it failed). - It then
iteratively computes the factorial. For each iteration, it prints trace messages: - Before multiplication: e.g.,
"Step 3: result = 2 * 3" - After multiplication: e.g., " -> Intermediate result after multiplying by 3 = 6" - After
the loop, it prints the final result in a friendly format ("Factorial of n is result"), and then also prints the
result number on its own line. The reason for the separate line with just the number is to help the Node
backend identify the result distinctly. We designed the Node code to treat a purely numeric last line as the
final result value. - (We could have achieved similar tracing using the snoop library by simply decorating
the function with @snoop , which would automatically log each line executed and variables changed .
For example, adding the decorator from snoop would produce a detailed play-by-play log of the function,
including which lines ran and when, and the values of local variables at each step . Here, we manually print
traces for clarity and control over format. In a real scenario, using snoop or Python’s logging with a
custom sys.settrace function could provide more automated tracing.)
When this script is run (e.g. python factorial_trace.py 5 ), its stdout will contain the step-by-step
logs and the final result. For example, it might output:
Starting factorial computation for n=5
Step 1: result = 1 * 1
-> Intermediate result after multiplying by 1 = 1
Step 2: result = 1 * 2
-> Intermediate result after multiplying by 2 = 2
Step 3: result = 2 * 3
-> Intermediate result after multiplying by 3 = 6
Step 4: result = 6 * 4
-> Intermediate result after multiplying by 4 = 24
Step 5: result = 24 * 5
-> Intermediate result after multiplying by 5 = 120
Factorial of 5 is 120
120
The Node backend will receive that output. It will treat every line except the last as part of the trace log, and
the final line 120 as the actual result value (since it’s numeric). These logs are sent back to the frontend to
be displayed step-by-step, and the result is shown separately as “Result = 120”.
4
4
10
This demonstrates how Python is used for control-flow intensive tasks where we want detailed insight
into each step. We could add more examples in Python (for instance, a conditional branching demo or using
a library like trace or pdb to step through code), but the factorial example suffices for now.
R Scripts (Statistical Ops & Plotting)
In the backend/scripts/r/ directory, we place operations better suited for R – typically data analysis or
visualization tasks. R is powerful for statistical transformations and creating plots (for example with
ggplot2). The Node backend will call these R scripts via the command line using Rscript . The R script will
perform its task (possibly reading input from command args, doing computation/plotting) and then output
any textual log or status, and save any visual result to a file.
Example: a script that generates a simple plot of random data points and saves it as an image.
Filename: backend/scripts/r/plot_data.R :
#!/usr/bin/env Rscript
# Load libraries
library(ggplot2)
# Get command-line argument (number of points)
args <- commandArgs(trailingOnly = TRUE)
n <- if (length(args) > 0) as.numeric(args[1]) else 0
if (is.na(n)) {
write("Invalid numeric input for points.", stderr())
quit(status=1)
}
if (n <= 0) {
write("Please provide a positive number of points.", stderr())
quit(status=1)
}
# Generate a simple dataset: e.g., y = cumulative sum of random normal values
data <- data.frame(x = 1:n, y = cumsum(rnorm(n)))
write(sprintf("Generated data with %d points (first 5 shown):", n), stdout())
print(head(data, 5)) # print first 5 rows as a preview
# Plot the data using ggplot2
p <- ggplot(data, aes(x = x, y = y)) +
geom_line(color="steelblue") +
ggtitle(sprintf("Random Walk with %d points", n)) +
theme_minimal()
# Save the plot to an image file in the output directory
output_path <- file.path(dirname(sys.frame(1)$ofile), "..", "output",
11
"plot_output.png")
ggsave(filename=output_path, plot=p, width=6, height=4)
write(paste("Plot saved to", output_path), stdout())
# Optionally, print a confirmation message
write("Plot generation completed.", stdout())
What this R script does: - It uses commandArgs(trailingOnly = TRUE) to get the input (number of
points n ). - It validates n (must be a positive number). If invalid, it writes an error message to stderr and
exits with a non-zero status (so Node knows it failed). - It then creates a random dataset of n points: x
from 1 to n, and y as a cumulative sum of n random normal values ( rnorm(n) gives n random values,
cumsum makes it a random walk). - It writes a message to stdout about the data generation and prints the
first 5 rows of the data frame (so that appears in the logs). - It uses ggplot2 to create a line plot of the data
(a simple random walk plot). We set a title and minimal theme for aesthetics. - It saves the plot to an image
file. We determine an output path: here we go up one directory from the script’s location and into output/
plot_output.png . ( dirname(sys.frame(1)$ofile) gives the directory of the currently running R
script, so one directory up from that is the scripts folder, then ../output gets the output directory.
We could also just specify a relative path if we run Rscript from the backend directory.) - We use ggsave to
save the plot as a PNG file of size 6x4 inches. - We write a confirmation to stdout indicating where the plot
was saved, and a final "completed" message.
When run with, say, Rscript plot_data.R 100 , this script will produce on stdout some lines like:
Generated data with 100 points (first 5 shown):
x y
1 1 -0.2930201
2 2 -1.1903081
3 3 -1.0081185
4 4 -0.5604648
5 5 -0.6502532
Plot saved to /path/to/backend/output/plot_output.png
Plot generation completed.
These lines will be captured by Node as the logs array. The actual image file plot_output.png will be
created in the output folder. The Node backend (as shown earlier) returns the path /output/
plot_output.png to the frontend. Since we set up Express to serve that directory, the React app can then
display the image by setting it in an <img src={plotUrl} /> tag.
This demonstrates using R for a task that is heavy on data and visualization. We could have also had R
output some numeric results or summary (which could be parsed by Node if needed), but here the main
result is the plot image. The trace logs for R are simpler (just textual messages and a data preview) – R isn’t
providing a line-by-line trace of its execution (though we printed a few key steps). If needed, one could also
use R’s debugging tools or verbose output to trace, but usually Python is easier for detailed step tracing,
whereas R we use for the final data processing and plotting.
12
(Note: Ensure that the R environment has ggplot2 installed. In development, you’d run
install.packages("ggplot2") beforehand. Similarly, for Python, ensure any needed packages like
snoop or others are installed via pip. We can maintain a requirements.txt in the scripts/python
directory, e.g. containing snoop if we intend to use it.)
One-Command Development Setup (Concurrently)
To streamline the development process, we use the concurrently utility to run multiple processes (React
dev server, Node server, etc.) with a single command. The root package.json is configured with scripts to
facilitate this.
First, we include concurrently (and nodemon for auto-reloading the Node server on code changes) as
devDependencies in the root or backend package. The structure here will use the root package.json to
orchestrate the sub-projects:
Root package.json (excerpt):
{
"name": "fullstack-code-exec-demo",
"version": "1.0.0",
"private": true,
"scripts": {
"install-all": "npm install --prefix backend && npm install --prefix
frontend",
"dev": "concurrently \"npm:dev-backend\" \"npm:dev-frontend\"",
"dev-backend": "npm run start:dev --prefix backend",
"dev-frontend": "npm start --prefix frontend"
},
"devDependencies": {
"concurrently": "^8.0.0"
}
}
backend/package.json (excerpt):
{
"name": "backend",
"version": "1.0.0",
"main": "server.js",
"scripts": {
"start": "node server.js",
"start:dev": "nodemon server.js"
},
"dependencies": {
"express": "^4.18.0",
13
"winston": "^3.8.0"
},
"devDependencies": {
"nodemon": "^2.0.22"
}
}
frontend/package.json (excerpt): will be whatever Create React App provides. We might add a proxy here
for development:
{
"name": "frontend",
"version": "0.1.0",
"private": true,
"dependencies": {
"react": "^18.2.0",
"react-dom": "^18.2.0",
"react-scripts": "5.0.1"
},
"scripts": {
"start": "react-scripts start",
"build": "react-scripts build",
"test": "react-scripts test"
},
"proxy": "http://localhost:5000" // Proxy API calls in dev to the backend
}
Explanation: - The root script install-all will install dependencies in both subfolders. (This is optional,
as one could also run npm install in each, but it’s a convenience script.) - The dev script uses
concurrently to run two other scripts in parallel: dev-backend and dev-frontend . We reference them
with the npm:scriptName notation which runs an npm script from the same package, but we add the --
prefix option to run scripts in subdirectories: - npm run start:dev --prefix backend runs the
backend’s dev server (which we set to use nodemon). - npm start --prefix frontend runs the React
development server (which by default will open the app in the browser on port 3000). - This single
command npm run dev at the root will thus spawn both the Node server (via nodemon on port 5000)
and the React dev server (port 3000) concurrently . Concurrently makes it easy to manage both and see
combined output in the terminal. - We included concurrently in devDependencies at the root, and nodemon
in the backend’s devDependencies (to restart the server on file changes). This aligns with common full-stack
JavaScript setups , where you have a single package managing both client and server for development
convenience.
To illustrate from the StackOverflow example of a similar setup, the scripts section might look like this,
combining server and client start commands :
5
5
5
14
"scripts": {
"start": "nodemon server.js",
"server": "nodemon server.js",
"client": "npm start --prefix client",
"dev": "concurrently \"npm run server\" \"npm run client\""
},
"devDependencies": {
"nodemon": "...",
"concurrently": "..."
}
This shows how concurrently can run both the server and client together . In our project, we named the
folder frontend instead of client and structured it similarly.
With this setup, a developer can simply run npm run dev in the project root and have both the frontend
and backend start up. The React app will proxy API calls to the Node backend (as configured by the "proxy"
setting or by enabling CORS on the server), so everything works together seamlessly in development.
Running the Project (Installation & Usage)
To get started with this unified project, follow these steps:
Prerequisites: Ensure you have Node.js (and npm) installed, as well as Python 3 and R installed on
your system.
Python is needed to run the Python scripts. (If the Python scripts use extra libraries like snoop ,
install them via pip . For example, run pip install snoop or use
pip install -r backend/scripts/python/requirements.txt if such a file is provided.)
R is needed to run the R scripts. Make sure to install the R packages used by the scripts. In our
example, we need the ggplot2 package. You can install it by launching R and running
install.packages("ggplot2") .
Ensure the commands python and Rscript are available in your PATH (so that Node can call
them).
Install dependencies: In the project root, run:
npm install
This will install root devDependencies (like concurrently). Then run:
npm run install-all
5
1.
2.
3.
4.
5.
15
This will install dependencies for both the backend and frontend sub-projects (it runs
npm install in each). Alternatively, you can manually run npm install in frontend/ and
npm install in backend/ if you prefer.
Start the development servers: Run the one-liner:
npm run dev
This uses concurrently to start:
The React development server (usually on http://localhost:3000) – you should see the React app
open in your browser.
The Express backend server (on http://localhost:5000) – which the React app will communicate with
(the proxy is set to forward API calls to this).
Both will reload automatically on code changes (thanks to React Scripts for the frontend, and
nodemon for the backend).
Use the app: In the browser (React app), try the available operations:
For example, enter a number and click "Run Factorial". The app will send a request to the backend
(POST /api/run with op="factorial"). The backend will run the Python script, capture the trace logs
and result, and respond. The frontend will display the logs (each step of the factorial calculation) and
the final result.
Click "Generate Plot". The app will request op="plot". The backend runs the R script with the given
number of points, which generates a plot image and saves it. The backend responds with the logs
(e.g., data preview and confirmation messages) and a URL to the plot image. The frontend then
displays the image and the logs. You should see a line chart rendered in the page and the textual
logs from the R script below it.
Logs and troubleshooting:
The backend will log details to the console and to backend/logs/app.log . You can open that file
to see structured logs of what happened (e.g., request received, script started, any errors, script
completed, etc.). For example, an info log might say: info: Received operation request:
op=factorial, param=5 and later info: Operation factorial completed, result=120 .
Errors (if any) will be logged with stack traces in that file as well.
If something goes wrong (say the R script fails because ggplot2 isn’t installed), the error will be
captured and sent to the frontend (you’d see an error message in the UI), and more details will be in
the backend logs.
You can modify the scripts or add new ones, and the system is flexible to route new op codes to
new scripts. Just be sure to restart or adjust the code if you add new operations.
Shutdown: Use Ctrl+C in the terminal to stop the concurrently running processes when done.
6.
7.
8.
9.
10.
11.
12.
13.
14.
15.
16.
17.
16
Additional Considerations
Extensibility: This structure cleanly separates the concerns. You can add more Python scripts for
other algorithms or more R scripts for different analyses. The Node route can be extended (e.g., a
switch or if-else for different op values). For a larger number of operations, you might factor out
the logic into separate router/controller files or even generate an operation mapping dynamically.
Security: Ensure that the API only allows intended operations. In this simple setup, the op comes
from the client. In a real scenario, you’d want to validate this and not allow arbitrary commands.
Perhaps maintain an allowed list of scripts to run, and never directly use unsanitized input in a shell
command. (Here we at least choose the script path based on known op names.)
Using rpy2 (alternative): As mentioned, one could call R from within Python using rpy2 . For
example, a Python script could use import rpy2.robjects as robjects and load ggplot2
to create a plot, then save it. This would let you have a single Python process handle both the logic
and the R plotting, avoiding the need to call Rscript separately. If going that route, your Node
backend might only call Python for everything (and the Python code decides when to invoke R via
rpy2). This can be more efficient if you have many cross-language calls, at the cost of added
complexity in the Python code. Rpy2 essentially “provides an interface that allows you to run R in Python
processes” , letting you use R’s packages (like ggplot2) directly from Python. This project sticks
to separate scripts for clarity, but it's good to know you could unify that if needed.
Production Build: In development, we run two servers. For a production deployment, you would
typically run npm run build in frontend/ to produce static files, and have the Node server
serve those (using app.use(express.static('frontend/build')) and perhaps a catch-all
route to serve index.html for SPA). The backend would then serve both the frontend and
continue to handle API calls. The folder structure can accommodate that; just ensure the build
output is placed in an appropriate folder or moved into the backend for serving. The
concurrently approach is mainly for dev convenience.
Visual assets: We designated an output/ folder for generated images. If the project had static
images or other assets for the frontend, those would typically live in frontend/public . Here,
dynamically generated images by R are saved server-side and served on request. Make sure to add
output/ (and possibly logs/ ) to .gitignore if this is a git project, to avoid tracking
generated files or large logs.
With this setup and structure, you have a cohesive project where: - React provides an interactive UI. -
Express/Node provides a robust API layer with logging and error handling. - Python handles algorithmic
tasks and tracing the execution flow (leveraging tools like print debugging or snoop to get detailed
insight). - R handles statistical computation and creating rich visualizations (plots) which can be viewed in
the frontend.
All parts communicate through well-defined interfaces (REST API calls and file outputs), and the developer
experience is streamlined with a single command to run everything in development . This makes it easy
to develop and debug the full stack. Happy coding!
Concurrently npm with React Js - Stack Overflow
https://stackoverflow.com/questions/54186251/concurrently-npm-with-react-js
•
•
•
3
•
•
5
1 5
17
Mastering Winston for Production Logging in Node.js · Dash0
https://www.dash0.com/guides/winston-production-logging-nodejs
Calling R From Python With rpy2 · R Views
https://rviews.rstudio.com/2022/05/25/calling-r-from-python-with-rpy2/
GitHub - alexmojaki/snoop: A powerful set of Python debugging tools, based on PySnooper
https://github.com/alexmojaki/snoop
2
3
4
18
