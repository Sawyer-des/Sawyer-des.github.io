document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('taskInput');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');

    // Function to add a new task
    function addTask() {
        const taskText = taskInput.value.trim();

        if (taskText !== "") {
            // Create the list item and its content
            const newTask = document.createElement('li');
            newTask.innerHTML = `
                <span>${taskText}</span>
                <div class="progress-container">
                    <div class="progress-bar"></div>
                </div>
                <button class="other-button">Started</button>
                <button class="other-button2">50% Done</button>
                <button class="other-button3">100% Done</button>
                <button class="delete-button">Delete</button>
            `;

            // Add a click listener to toggle 'completed'
            newTask.addEventListener('click', function (event) {
                if (event.target.tagName !== 'BUTTON') {
                    newTask.classList.toggle('completed');
                }
            });

            // Grab this task’s progress bar
            const progressBar = newTask.querySelector('.progress-bar');

            // Button listeners
            newTask.querySelector('.delete-button').addEventListener('click', function () {
                taskList.removeChild(newTask);
            });

            newTask.querySelector('.other-button').addEventListener('click', function () {
                progressBar.style.width = "25%";
                progressBar.textContent = "Started";
            });

            newTask.querySelector('.other-button2').addEventListener('click', function () {
                progressBar.style.width = "50%";
                progressBar.textContent = "50%";
            });

            newTask.querySelector('.other-button3').addEventListener('click', function () {
                progressBar.style.width = "100%";
                progressBar.textContent = "Done!";
            });

            // Append the new task to the list
            taskList.appendChild(newTask);

            // Clear the input field
            taskInput.value = "";
        }
    }

    addButton.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            addTask();
        }
    });
});

//***********************************CLOCK SCRIPT BELOW**************************************

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    hours = hours.toString().padStart(2, '0');

    const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
    document.getElementById('clock').textContent = timeString;
}

setInterval(updateClock, 1000);
updateClock();
