// scripts.js
function openImage(imagePath) {
  window.open(imagePath, '_blank'); // Make sure the imagePath is correct
}

document.addEventListener("DOMContentLoaded", () => {
  const addClientButton = document.getElementById("addClientButton");
  const searchClientButton = document.getElementById("searchClientButton");


  if (addClientButton) {
    addClientButton.addEventListener("click", async () => {
      const firstname = document.getElementById("firstname").value;
      const lastname = document.getElementById("lastname").value;
      const clientId = document.getElementById("clientId").value;
      const failedMessage = document.getElementById("failedMessage");
      const messageElement = document.getElementById("Error");

      if (!firstname || !lastname || !clientId) {
        alert("Please fill in all fields.");
        failedMessage.style.display = 'block';
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ firstname, lastname, id: parseInt(clientId) })
        });

        const successMessage = document.getElementById("successMessage");

        if (response.ok) {
          successMessage.style.display = 'block';
        } 
        else {
          const errorMessage = await response.text();
          if (errorMessage === 'ID already taken') {
            alert("The ID has already been taken. Please choose a different ID.");
            failedMessage.style.display = 'block';
          } else {
            alert("Error adding client.");
            messageElement.style.display = 'block';
      } 
    }
  }
      catch (error) {
        console.error('Error:', error);
        alert("Error adding client.");
        messageElement.style.display = 'block';
      }
    });
  }


  if (searchClientButton) {
    searchClientButton.addEventListener("click", async () => {
      const searchFirstName = document.getElementById("searchFirstName").value;
      const searchLastName = document.getElementById("searchLastName").value;
      const searchId = document.getElementById("searchId").value;

      const clientList = document.getElementById("clientList");
      clientList.innerHTML = "";

      try {
        console.log('Sending request to server with:', {
          firstname: searchFirstName,
          lastname: searchLastName,
          id: searchId.parseInt
        });

        const response = await fetch(`http://localhost:5000/patients?firstname=${encodeURIComponent(searchFirstName)}&lastname=${encodeURIComponent(searchLastName)}&id=${encodeURIComponent(searchId)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const clients = data.results;
          const debugInfo = data.debug;

          console.log('Received response:', clients);
          console.log('Debug Info:', debugInfo);

          if (clients.length > 0) {
            clients.forEach(client => {
              const li = document.createElement("li");
              li.textContent = `ID: ${client.id}, Name: ${client.firstname} ${client.lastname}`;
              clientList.appendChild(li);

            });
           
          }

           else {
            clientList.innerHTML = "<p>No clients found.</p>";
          }
        } else {
          alert("Error searching for clients.");
        }
      } catch (error) {
        console.error('Error:', error);
        alert("Error searching for clients.");
      }
    });
  }
  
});
  

    