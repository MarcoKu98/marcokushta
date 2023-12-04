const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav__link')

navToggle.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
    })
})

function calculateMean(values) {
    return values.reduce((a, b) => a + b) / values.length;
}

function calculateStdDev(values, mean) {
    return Math.sqrt(values.map(value => Math.pow(value - mean, 2)).reduce((a, b) => a + b) / values.length);
}

function calculatePearson(x, y) {
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    let n = x.length;

    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
        sumY2 += y[i] * y[i];
    }

    let numerator = sumXY - (sumX * sumY / n);
    let denominator = Math.sqrt((sumX2 - (sumX * sumX / n)) * (sumY2 - (sumY * sumY / n)));

    if (denominator === 0) {
        return 0;
    }

    return numerator / denominator;
}

function calculateRegressionLine(x, y) {
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    let n = x.length;

    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
    }

    let slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    let intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

let xValues = [];
let yValues = [];

document.getElementById('calculate-button').disabled = true;

document.getElementById('load-button').addEventListener('click', function(event) {
    event.preventDefault();
    var fileInput = document.getElementById('file-input');
    var file = fileInput.files[0];
    if (!file) {
        document.getElementById('error').innerText = 'Please select a file.';
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, {type: 'array'});
        
        // Assuming the data is in the first sheet and columns A (x values) and B (y values)
        var worksheet = workbook.Sheets[workbook.SheetNames[0]];
        var jsonData = XLSX.utils.sheet_to_json(worksheet, {header: ["x", "y"]});
        
        for (var i = 0; i < jsonData.length; i++) {
            var x = parseFloat(jsonData[i].x);
            var y = parseFloat(jsonData[i].y);
            if (isNaN(x) || isNaN(y)) {
                document.getElementById('error').innerText = 'Invalid file format. Please upload an Excel file with two columns of numbers.';
                return;
            }
            xValues.push(x);
            yValues.push(y);
            var row = document.createElement('tr');
            row.innerHTML = '<td>' + x + '</td><td>' + y + '</td>';
            document.getElementById('data-points').appendChild(row);
        }
        document.getElementById('error').innerText = '';
        document.getElementById('calculate-button').disabled = false;
    };
    reader.readAsArrayBuffer(file);
});


document.getElementById('add-button').addEventListener('click', function(event) {
    event.preventDefault();
    var x = parseFloat(document.getElementById('x').value);
    var y = parseFloat(document.getElementById('y').value);
    if (!x || !y || isNaN(x) || isNaN(y)) {
        document.getElementById('error').innerText = 'Please enter a real number.';
        return;
    }
    xValues.push(x);
    yValues.push(y);
    var row = document.createElement('tr');
    row.innerHTML = '<td>' + x + '</td><td>' + y + '</td>';
    document.getElementById('data-points').appendChild(row);
    document.getElementById('error').innerText = '';
    document.getElementById('calculate-button').disabled = false;
});

let chart;

document.getElementById('calculate-button').addEventListener('click', function(event) {
    event.preventDefault();
    var meanX = calculateMean(xValues);
    var meanY = calculateMean(yValues);
    var stdDevX = calculateStdDev(xValues, meanX);
    var stdDevY = calculateStdDev(yValues, meanY);
    var correlation = calculatePearson(xValues, yValues);
    var interpretation = 'No correlation';
    if (Math.abs(correlation) > 0.1) {
        interpretation = 'Some correlation';
    }
    if (Math.abs(correlation) > 0.3) {
        interpretation = 'Strong correlation';
    }
    document.getElementById('results').innerText = 
        'Mean of X: ' + meanX + '\n' +
        'Mean of Y: ' + meanY + '\n' +
        'Standard deviation of X: ' + stdDevX + '\n' +
        'Standard deviation of Y: ' + stdDevY + '\n' +
        'Pearson correlation coefficient: ' + correlation + '\n' +
        'Interpretation: ' + interpretation;

        //Destroy (old) chart
        if (chart) {
            chart.destroy();
        }

        //Holding array for color costumization
        var colors = xValues.map(() => getRandomColor());
        
        // Calculate regression line
        var regressionLine = calculateRegressionLine(xValues, yValues);
         // Make plot
        var ctx = document.getElementById('scatter-plot').getContext('2d');
        chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Scatter Plot',
                    data: xValues.map(function(e, i) {
                        return {
                            x: e,
                            y: yValues[i]
                        };
                    }),
                    pointBackgroundColor: colors,
                }, {
                    label: 'Regression Line',
                    data: xValues.map(function(e) {
                        return {
                            x: e,
                            y: regressionLine.slope * e + regressionLine.intercept
                        };
                    }),
                    type: 'line',
                    fill: false,
                    borderColor: '#fff',
                    pointRadius: 0
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        ticks: {
                            color: '#fff'  // Change the color of the x axis here
                        }
                    },
                    y: {
                        ticks: {
                            color: '#fff'  // Change the color of the y axis here
                        }
                    }
                }
            }
        });
    });