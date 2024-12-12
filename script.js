let selectedFileType = '';
let costPerPage = 0;
let serveoUrl = ''; // Store the Serveo URL here
let scanner = null; // To store the scanner instance
let cameraActive = false; // To track camera status

// Function to select the file type and set the appropriate cost
function selectFileType(fileType, cost) {
    document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
    selectedFileType = fileType;
    costPerPage = cost;
    document.getElementById(fileType).classList.add('selected');
    
    if (fileType === 'file3') {
        document.getElementById('uploadForm').style.display = 'block';
        document.getElementById('pageCountContainer').style.display = 'none';
        document.getElementById('error').textContent = '';
        document.getElementById('costDisplay').innerText = '0';
    } else {
        document.getElementById('uploadForm').style.display = 'none';
        document.getElementById('pageCountContainer').style.display = 'block';
        document.getElementById('pageCount').value = '';
    }
    document.getElementById('costContainer').style.display = 'block';
    document.getElementById('payButton').style.display = 'block';
    
    // Stop the camera if it's not needed
    if (fileType === 'file3') {
        stopCamera(); // Stop camera if file3 is selected
    } else {
        // Ensure camera is stopped when switching to file1 or file2, if necessary
        if (cameraActive) {
            stopCamera();
        }
    }
}

// Function to calculate the cost based on the page count
function calculateCost() {
    const pageCount = parseInt(document.getElementById('pageCount').value) || 0;
    if (pageCount > 0) {
        const totalCost = pageCount * costPerPage;
        document.getElementById('costDisplay').innerText = totalCost.toFixed(2);
        document.getElementById('error').textContent = '';
    } else {
        document.getElementById('costDisplay').innerText = '0';
    }
}

// Function to handle file upload and read the PDF
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file && file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = function () {
            const typedArray = new Uint8Array(reader.result);
            pdfjsLib.getDocument(typedArray).promise.then(function (pdf) {
                let pageCount = pdf.numPages;
                let totalCost = pageCount * costPerPage;
                document.getElementById('costDisplay').innerText = totalCost.toFixed(2);
                document.getElementById('error').textContent = '';
            }).catch(function () {
                document.getElementById('error').textContent = 'Error reading PDF. Please upload a valid file.';
                document.getElementById('costDisplay').innerText = '0';
            });
        };
        reader.readAsArrayBuffer(file);
    } else {
        document.getElementById('error').textContent = 'Please upload a valid PDF file.';
        document.getElementById('costDisplay').innerText = '0';
    }
}

// Function that starts the payment process and triggers QR scanning
function startPayment() {
    alert('Starting payment process...'); // Placeholder for actual payment implementation
    startQRScanner(); // Starts the QR Scanner
}

// Function to send the open request to the URL
function sendOpenRequest(endpoint) {
    const endpointUrl = `${serveoUrl}${endpoint}`; // Append the selected endpoint
    fetch(endpointUrl)
        .then(response => response.json())
        .then(data => {
            alert('Request sent successfully');
            console.log(data);
        })
        .catch(error => {
            alert('Error: ' + error);
            console.log(error);
        });
}

// Function to initialize and start the QR scanner
function startQRScanner() {
    const previewElement = document.getElementById('preview');
    
    // Show the preview element when QR scanning starts
    previewElement.style.display = 'block';
    
    // Check if the camera is already active
    if (cameraActive) {
        // If the camera is active, we don't start a new instance
        return;
    }
    
    scanner = new Instascan.Scanner({ video: previewElement });

    // Attempt to get available cameras
    Instascan.Camera.getCameras().then(cameras => {
        if (cameras.length > 0) {
            // Start the scanner with the first available camera
            scanner.start(cameras[0]).then(() => {
                cameraActive = true; // Camera is active
            }).catch(err => {
                console.error('Error starting the camera:', err);
                alert("Error starting the camera.");
            });
        } else {
            alert("No cameras found.");
        }
    }).catch(err => {
        console.error('Error accessing cameras:', err);
        alert("Error accessing cameras.");
    });

    // Listen for QR code scan
    scanner.addListener('scan', function(content) {
        serveoUrl = content;  // Store the result of the QR code scan
        alert(`QR Code scanned! Serveo URL: ${serveoUrl}`);
        let endpoint = '';
        switch (selectedFileType) {
            case 'file1':
                endpoint = '/print_static_file_1';
                break;
            case 'file2':
                endpoint = '/print_static_file_2';
                break;
            case 'file3':
                endpoint = '/print_static_file_3';
                break;
            default:
                alert('No file selected.');
                return;
        }
        sendOpenRequest(endpoint); // Send the selected endpoint to the Serveo URL
    });
}

// Function to stop the camera
function stopCamera() {
    if (scanner && cameraActive) {
        scanner.stop(); // Stop the camera stream
        cameraActive = false; // Camera is no longer active
        document.getElementById('preview').style.display = 'none'; // Hide the preview
    }
}
