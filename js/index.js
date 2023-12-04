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

document.getElementById('pearson-form').addEventListener('submit', function(event) {
    event.preventDefault();
    var x = document.getElementById('x').value;
    var y = document.getElementById('y').value;
    fetch('/pearson', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'x=' + encodeURIComponent(x) + '&y=' + encodeURIComponent(y),
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }
        return response.json();
    })
    .then(function(results) {
        document.getElementById('results').innerText = JSON.stringify(results);
    })
    .catch(function(error) {
        document.getElementById('results').innerText = 'An error occurred: ' + error.message;
    });
});
