## Developed By

**Muhammad Raaid Khan**

## Installation Instruction

* Clone the Repository
* Run command `npm install electron` in the folder to install *Electron*
* Run command `npm start` to run the application

## Main GUI

Below it the Main GUI Window

![alt text](./Pictures/image.png)

## Adding Blocks

* Blockly blocks can be added from the Left
  ![alt text](./Pictures/image-1.png)
* Numbers Can be Added into Blocks
  ![alt text](./Pictures/image-2.png)


## Compiling CSV

* On Clicking `Compile to CSV` button, a CSV File will be created in folder `/csv_output
* Below is the contents of CSV file
  ![alt text](./Pictures/image-3.png)


## Running Script

* On Clicking `Run Script` button, a Python Script will be executed.
* Outputs are shown in *Tkinter* Window
  ![alt text](./Pictures/image-4.png)


## Output Results 
* In case the execution of block is done correctly, it will turn **Green**
  ![alt text](./Pictures/image-5.png)
  * Websockets are implemented to send status from Python Backend to Electron Frontend

## False Output

* In case the execution of block is False, it will turn **Red**
  ![alt text](./Pictures/image-6.png)
* Compiling to CSV
* Running Script
  ![alt text](./Pictures/image-7.png)