// const path = require('path');
// const fs = require('fs');

// // Define output directory and python script path
// const OUTPUT_DIR = path.join(__dirname, 'output');
// const PYTHON_SCRIPT = path.join(__dirname, 'process_csv.py');

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
                <category name="Math" colour="#5CA65C">
                    <block type="math_arithmetic"></block>
                </category>
                <category name="Database" colour="#A55B5B">
                    <block type="fetch_from_database"></block>
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

    // Handle Compile Button Click
    compileButton.addEventListener('click', () => {
        const xml = Blockly.Xml.workspaceToDom(workspace);
        const logic = Blockly.Xml.domToText(xml);

        const csvContent = `"Blockly Logic"\n"${logic}"`;
        const filePath = './output/blockly_output.csv';

        // Create 'output' directory if not exists
        if (!fs.existsSync('./output')) {
            fs.mkdirSync('./output');
        }

        // Save logic as CSV file
        fs.writeFile(filePath, csvContent, (err) => {
            if (err) {
                console.error('Failed to save CSV:', err);
                alert('Error: Unable to save the file.');
            } else {
                console.log('CSV file saved at:', filePath);
                alert(`CSV file saved to: ${filePath}`);
            }
        });
    });

    // Handle Run Button Click (Execute Python Script)
    runButton.addEventListener('click', () => {
        const command = 'python process_csv.py';  // Example Python script command

        // Call execCommand from preload.js (communicating with main process)
        window.electron.execCommand(command)
            .then(stdout => {
                console.log('Python Script Output:', stdout);
                alert(`Python Script Executed Successfully:\n${stdout}`);
            })
            .catch(err => {
                console.error('Error executing script:', err);
                alert(`Error executing script:\n${err}`);
            });
    });
});
