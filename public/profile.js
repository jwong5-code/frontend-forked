document.addEventListener("DOMContentLoaded", () => {
    const clientId = new URLSearchParams(window.location.search).get('id');
    const searchClientButton = document.getElementById("searchClientButton");
    const clientList = document.getElementById("clientInfo");
    if (clientId) {
        fetchProfile(clientId);
        showProfileSection(clientId);
    }
    if (searchClientButton) {
        searchClientButton.addEventListener("click", async () => {
            const searchFirstName = document.getElementById("searchFirstName").value;
            const searchLastName = document.getElementById("searchLastName").value;
            const searchId = document.getElementById("searchId").value;
      
            const clientList = document.getElementById("clientInfo");
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
                    const a = document.createElement("a");
                    const p = document.createElement("p");
                    a.href = `profile.html?id=${client.id}`;
                    a.textContent = `ID: ${client.id}, Name: ${client.firstname} ${client.lastname}`;
      
                    // Append the link to the list item
                    li.appendChild(a);
                    li.appendChild(p);
      
                    // Append the list item to the client list
                    clientList.appendChild(a);
                    clientList.appendChild(p);

                  });
                 
                } else {
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



    async function showProfileSection(clientId) {
        try {
          //const response = await fetch(`http://localhost:5000/patients/?id=${clientId}`);
          const response = await fetch(`http://localhost:5000/patients?firstname=${encodeURIComponent(searchFirstName)}&lastname=${encodeURIComponent(searchLastName)}&id=${encodeURIComponent(searchId)}`);

          const data = await response.json();
          if (data) {
            document.getElementById('id').value = data.client.id;
            document.getElementById('firstname').value = data.client.firstname;
            document.getElementById('lastname').value = data.client.lastname;
      
            // Show hidden elements
            document.getElementById('labelImage').style.display = 'block';
            document.getElementById('image').style.display = 'block';
            document.getElementById('updateProfileButton').style.display = 'block';
            document.getElementById('deleteProfileButton').style.display = 'block';
      
            document.getElementById('clientSearchSection').style.display = 'none';
            document.getElementById('clientProfileSection').style.display = 'block';
          } else {
            console.error('Error: Client data is undefined');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
      
      function goBack() {
        document.getElementById('clientSearchSection').style.display = 'block';
        document.getElementById('clientProfileSection').style.display = 'none';
        window.history.pushState({}, document.title, window.location.pathname);
      }
      
      async function updateProfile() {
        const clientId = document.getElementById('id').value;
        const firstname = document.getElementById('firstname').value;
        const lastname = document.getElementById('lastname').value;
        const images = document.getElementById('image').files;
      
        const formData = new FormData();
        formData.append('firstname', firstname);
        formData.append('lastname', lastname);
        for (let i = 0; i < images.length; i++) {
          formData.append('image', images[i]);
        }
      
        try {
          const response = await fetch(`http://localhost:5000/patients/${clientId}`, {
            method: 'PUT',
            body: formData
          });
          if (response.ok) {
            alert('Profile updated successfully!');
            showProfileSection(clientId); // Refresh profile data after update
          } else {
            alert('Error updating profile.');
          }
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      }
      
      async function deleteProfile() {
        const clientId = document.getElementById('id').value;
        if (confirm('Are you sure you want to delete this profile?')) {
          try {
            const response = await fetch(`http://localhost:5000/patients/${clientId}`, {
              method: 'DELETE'
            });
            if (response.ok) {
              alert('Profile deleted successfully!');
              goBack();
            } else {
              alert('Error deleting profile.');
            }
          } catch (error) {
            console.error('Error deleting profile:', error);
          }
        }
      }

});
