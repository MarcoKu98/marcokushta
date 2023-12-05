// Side tab buttons and menu button 
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav__link')

// event listener to open nav
navToggle.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
});
// event listener to close nav
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
    })
})

// Takes an array as input, returns mean 
function calculateMean(values) {
    return values.reduce((a, b) => a + b) / values.length;
}

// Takes an array and their mean as input
// Returns the standard deviation of the array
function calculateStdDev(values, mean) {
    return Math.sqrt(values.map(value => Math.pow(value - mean, 2)).reduce((a, b) => a + b) / values.length);
}

/* 
   Takes two arrays as input
   Returns the coefficient denominator if not zero
   Else returns 0
*/ 
function calculatePearson(x, y) {
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    let n = x.length;
    
    //Iterate through, get sums
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
        sumY2 += y[i] * y[i];
    }
    
    //Calculate Pearson correlation
    let numerator = sumXY - (sumX * sumY / n);
    let denominator = Math.sqrt((sumX2 - (sumX * sumX / n)) * (sumY2 - (sumY * sumY / n)));

    if (denominator === 0) {
        return 0;
    }

    return numerator / denominator;
}
/* 
   Function to calculate the linear regression for the scatter plot
   Takes in two arrays as input
   Returns an object containing the slope and intercept 
*/
function calculateRegressionLine(x, y) {
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    let n = x.length;

    //Iterate through the data points
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

// Function to randomize colors for points in scatter plot
// Returns a color of # format
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Initializing variables 
let xValues = [];
let yValues = [];

// Calculate button is disabled prior to entering event listener
document.getElementById('calculate-button').disabled = true;

/* 
   "Load" Button event listener.
   After the user has chosen an xlsx file, this function
   will transform it into a JSON format and extract
   each value for each data point.
   It will then create a row for all the values 
   under the right column.
*/
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
        
        // Assuming the data is in the first sheet, i.e., columns A and B in Excel
        var worksheet = workbook.Sheets[workbook.SheetNames[0]];
        var jsonData = XLSX.utils.sheet_to_json(worksheet, {header: ["x", "y"]});
        
        // Iterating through each row and retrieving x and y values
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
        //Enabling the calculate button
        document.getElementById('calculate-button').disabled = false;
    };
    reader.readAsArrayBuffer(file);
});

/*
    "Add" button event listener.
    Retrieves entered values by the user, checks for null and incorrect entry.
    If everything is correct, adds them to a new row in the table.
*/
document.getElementById('add-button').addEventListener('click', function(event) {
    event.preventDefault();
    var x = parseFloat(document.getElementById('x').value);
    var y = parseFloat(document.getElementById('y').value);
    
    //Checking for initial errors with entering data
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
    //Enabling the calculate button
    document.getElementById('calculate-button').disabled = false;
});

// Initializing chart
let chart;
/*
    "Calculate" button event listener.
    Provides a naive interpretation based on calculated correlation.
    Displays results, and refreshes the chart if the user
    decides to add another data point after a first calculation
    Also builds and displays the plot.
*/
document.getElementById('calculate-button').addEventListener('click', function(event) {
    event.preventDefault();
    var meanX = calculateMean(xValues);
    var meanY = calculateMean(yValues);
    var stdDevX = calculateStdDev(xValues, meanX);
    var stdDevY = calculateStdDev(yValues, meanY);
    var correlation = calculatePearson(xValues, yValues);

    // Might not be correct, depends on context.
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
                    pointBackgroundColor: colors, // Scatter plot point colors
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