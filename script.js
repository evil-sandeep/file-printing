

let selectedFileType = '';
let costPerPage = 0;
let serveoUrl = ''; // Store the Serveo URL here

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
}

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

function startPayment() {
    alert('Starting payment process...'); // Placeholder for actual payment implementation
    startQRScanner();
}

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

function startQRScanner() {
    const scanner = new Instascan.Scanner({ video: document.getElementById('preview') });

    Instascan.Camera.getCameras().then(cameras => {
        if (cameras.length > 0) {
            scanner.start(cameras[0]);
        } else {
            alert("No cameras found.");
        }
    }).catch(err => console.error("Camera error: ", err));

    scanner.addListener('scan', content => {
        serveoUrl = content; // Assign scanned content to serveoUrl
        alert(`QR Code scanned! Serveo URL: ${serveoUrl}`);

        if (!selectedFileType) {
            alert('No file selected.');
            return;
        }

        const endpointMap = {
            file1: '/print_static_file_1',
            file2: '/print_static_file_2',
            file3: '/print_static_file_3',
        };

        const endpoint = endpointMap[selectedFileType] || '';
        if (endpoint) {
            sendOpenRequest(endpoint);
        } else {
            alert('Invalid file type selected.');
        }
    });
}