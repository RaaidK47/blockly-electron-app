// Define output directory and python script path
const OUTPUT_DIR = './csv_output';


window.addEventListener('DOMContentLoaded', () => {
    const compileButton = document.getElementById('compileButton');
    const runButton = document.getElementById('runButton');
    const blocklyDiv = document.getElementById('blocklyDiv');

    // Inject Blockly workspace into the div
    const workspace = Blockly.inject(blocklyDiv, {
        toolbox: `
            <xml xmlns="https://developers.google.com/blockly/xml">
                <category name="Logic" colour="#5C81A6">
                    <block type="controls_if"></block>
                    <block type="logic_compare"></block>
                </category>
                <category name="Loops" colour="#5BA58C">
                    <block type="controls_for"></block>
                </category>
                <category name="Math" colour="#d2b4de">
                    <block type="math_arithmetic"></block>
                </category>
                <category name="Database" colour="#A55B5B">
                    <block type="fetch_from_database"></block>
                </category>
                <category name="Numbers" colour="#FDDA0D">
                    <block type="number_input"></block> <!-- Custom block added -->
                </category>
            </xml>
        `,
        grid: {
            spacing: 20,
            length: 3,
            colour: '#ccc',
            snap: true,
        },
        trashcan: true,
    });


    // Define custom block for 'fetch from database'
    Blockly.Blocks['fetch_from_database'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Fetch from database")
                .appendField(new Blockly.FieldTextInput("table_name"), "TABLE");
            this.setOutput(true, "String");
            this.setColour(230);
            this.setTooltip("Fetches data from the specified database table.");
            this.setHelpUrl("");
        }
    };

    // Define custom block for 'number_input'
    Blockly.Blocks['number_input'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("")
                .appendField(new Blockly.FieldNumber(0), "NUM"); // Default value is 0
            this.setOutput(true, "Number"); // Block output is a number
            this.setColour(230); // Set block color
            this.setTooltip("Enter a number");
            this.setHelpUrl(""); // Optional help URL
        }
    };

     // Function to generate CSV from Blockly workspace
     function saveBlocklyToCSV() {
        const workspace = Blockly.getMainWorkspace();
        const xml = Blockly.Xml.workspaceToDom(workspace); // Get XML from workspace
        const blocks = xml.getElementsByTagName('block');

        const rows = [['Block ID', 'Block Type', 'Operation', 'Parameter A', 'Parameter B', 'From', 'To', 'Increment', 'Table Name']]; // Header row
        
        Array.from(blocks).forEach((block) => {
            const blockId = block.getAttribute('id'); // Get the Block ID
            const blockType = block.getAttribute('type');

            if (blockType === 'logic_compare' || blockType === 'math_arithmetic'){
                const operation = block.querySelector('field[name="OP"]')?.textContent || '';
                const paramA = block.querySelector('field[name="NUM"]')?.textContent || '';
                const paramB = block.querySelector('value[name="B"] field[name="NUM"]')?.textContent || '';
                rows.push([blockId, blockType, operation, paramA, paramB]);
            }

            else if (blockType === 'controls_for'){
                const fromValue = block.getElementsByTagName("value")[0].getElementsByTagName("block")[0].getElementsByTagName("field")[0].textContent; // Get 'FROM' value
                const toValue = block.getElementsByTagName("value")[1].getElementsByTagName("block")[0].getElementsByTagName("field")[0].textContent; // Get 'TO' value
                const byValue = block.getElementsByTagName("value")[2].getElementsByTagName("block")[0].getElementsByTagName("field")[0].textContent; // Get 'BY' value
                rows.push([blockId, blockType, null, null, null, fromValue, toValue, byValue]);
            }
            
            else if (blockType === 'fetch_from_database') {
                // Extract database parameters
                const tableName = block.querySelector('field[name="TABLE"]')?.textContent || 'unknown_table';
                rows.push([blockId, blockType, null, null, null, null, null, null, tableName]);
            }
        });

        // Convert to CSV format (adjust this as needed)
        const csvContent = rows.map((row) => row.join(',')).join('\n');

        // Ensure output directory exists
        window.electron.ensureDirectoryExists(OUTPUT_DIR)
            .then(() => {
                const filePath = window.electron.getPath().join(OUTPUT_DIR, 'blockly_output.csv'); // Use the exposed path module
                return window.electron.saveCSV(csvContent, filePath);
            })
            .then((message) => {
                console.log(message);
                alert('CSV file saved successfully!');
            })
            .catch((err) => {
                console.error('Error saving CSV:', err);
                alert('Error saving CSV file. Close File if Open');
            });
    }

    

    // Handle Compile Button Click
    compileButton.addEventListener('click', () => {
        saveBlocklyToCSV();
    });

    // Function to initialize WebSocket
    function initializeWebSocket() {
        const socket = new WebSocket("ws://localhost:8765");

        socket.onopen = () => {
            console.log("WebSocket connected!");
            socket.send("Hello from JavaScript!");
        };

        socket.onmessage = (event) => {
            console.log("Message from server:", event.data);
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
            console.log("WebSocket closed.");
            const command = 'python backend/websocket_close.py';

            window.electron.execCommand(command)
            .then(stdout => {
                // console.log('Python Script Output:', stdout);

                // alert(`Python Script Executed Successfully:\n${stdout}`);
                // alert(`Python Script Executed Successfully`);
            })
            .catch(err => {
                console.error('Error executing script:', err);
                alert(`Error executing script:\n${err}`);
            });

        };

        // setInterval(() => {
        //     socket.send("ping");
        // }, 10000);

    }

    // Create Socket Funtion
    function createSocket() {
        const socket = new WebSocket("ws://localhost:8765");

        socket.onopen = () => {
            console.log("WebSocket connected!");
            socket.send("Hello from JavaScript!");
        };

        socket.onmessage = (event) => {
            console.log("Message from server:", event.data);
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
            console.log("WebSocket closed.");
            const command = 'python backend/websocket_close.py';

            window.electron.execCommand(command)
            .then(stdout => {
                // console.log('Python Script Output:', stdout);

                // alert(`Python Script Executed Successfully:\n${stdout}`);
                // alert(`Python Script Executed Successfully`);
            })
            .catch(err => {
                console.error('Error executing script:', err);
                alert(`Error executing script:\n${err}`);
            });

        };

        // setInterval(() => {
        //     socket.send("ping");
        // }, 10000);

    }

    // Initialize WebSocket connection immediately
    // createSocket();

    // Handle Run Button Click (Execute Python Script)
    runButton.addEventListener('click', () => {
        const command = 'python ./backend/process_csv.py';

        // // Listen for messages from the main process
        // window.electron.ipcRenderer.on('main-message', (event, message) => {
        //     console.log('Received message from main process:', message);
        // });

        window.electron.execCommand(command)
            .then(stdout => {
                // console.log('Python Script Output:', stdout);

                // alert(`Python Script Executed Successfully:\n${stdout}`);
                alert(`Python Script Executed Successfully`);
            })
            .catch(err => {
                console.error('Error executing script:', err);
                alert(`Error executing script:\n${err}`);
            });  
    });

    
    
});

