document.addEventListener("DOMContentLoaded", () => {
    const searchClientButton = document.getElementById("searchClientButton");
    const clientList = document.getElementById("clientInfo");
    const updateProfileButton = document.getElementById("updateProfileButton");
    const deleteProfileButton = document.getElementById("deleteProfileButton");
    const clientPhotos = document.getElementById("clientPictures");
  
    if (!searchClientButton) {
      console.error('searchClientButton not found');
    }
  
    if (!clientList) {
      console.error('clientInfo element not found');
    }
    
    if (updateProfileButton) {
        updateProfileButton.addEventListener("click", async () => {
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
        console.log('Sending request to edit server with:', {
            firstname: firstname,
            lastname: lastname,
            id: clientId
          });
  
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
})};
  
    if (searchClientButton) {
      searchClientButton.addEventListener("click", async () => {
        console.log('Search button clicked');
        const searchFirstName = document.getElementById("searchFirstName").value;
        const searchLastName = document.getElementById("searchLastName").value;
        const searchId = document.getElementById("searchId").value;
  
        console.log(`Searching for: ${searchFirstName} ${searchLastName} ID: ${searchId}`);
  
        clientList.innerHTML = "";
  
        try {          
          const response = await fetch(`http://localhost:5000/patients?firstname=${encodeURIComponent(searchFirstName)}&lastname=${encodeURIComponent(searchLastName)}&id=${encodeURIComponent(searchId)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
  
          if (!response.ok) {
            console.error('Error fetching data from server:', response.statusText);
            alert("Error searching for clients.");
            return;
          }
  
          const data = await response.json();
          if (!data) {
            console.error('Error: Response data is undefined');
            alert("Error processing server response.");
            return;
          }
  
          const clients = data.results;
          console.log('Clients fetched:', clients);
  
          if (clients && clients.length > 0) {
            clients.forEach(client => {
              const li = document.createElement("li");
              const button = document.createElement("button");
  
              
              button.textContent = `ID: ${client.id}, Name: ${client.firstname} ${client.lastname}`;
              console.log(`Created button for client ID: ${client.id}`);
  
              
              button.addEventListener('click', () => {
                console.log(`Button clicked for client ID: ${client.id}`); 
                showProfileSection(client.id);
              });
  
              // Append the button to the list item
              li.appendChild(button);
  
              // Append the list item to the client list
              clientList.appendChild(li);
            });
          } else {
            clientList.innerHTML = "<p>No clients found.</p>";
          }
        } catch (error) {
          console.error('Error:', error);
          alert("Error searching for clients.");
        }
      });
    }
  
    const clientId = new URLSearchParams(window.location.search).get('id');
    if (clientId) {
      showProfileSection(clientId);
    }
  });

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
  
  
  async function showProfileSection(clientId) {
    console.log(`Showing profile for client ID: ${clientId}`);
    try {
      const response = await fetch(`http://localhost:5000/patients/${clientId}`);
      if (!response.ok) {
        console.error('Error fetching profile:', response.statusText);
        alert("Error fetching profile.");
        return;
      }
  
      const data = await response.json();
      if (data) {
        document.getElementById('id').value = data.client.id;
        document.getElementById('firstname').value = data.client.firstname;
        document.getElementById('lastname').value = data.client.lastname;
  
        document.getElementById('patientName').textContent = `${data.client.firstname} ${data.client.lastname}: ${data.client.id}`;
  
        // Show all chances for update
        document.getElementById('labelImage').style.display = 'block';
        document.getElementById('image').style.display = 'block';
        document.getElementById('updateProfileButton').style.display = 'block';
        document.getElementById('deleteProfileButton').style.display = 'block';
  
        document.getElementById('clientSearchSection').style.display = 'none';
        document.getElementById('clientProfileSection').style.display = 'block';

        showPictures(clientId);
      } else {
        console.error('Error: Client data is undefined');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert("Error fetching profile.");
    }
  }

  async function showPictures(clientId) {
    console.log(`Fetching pictures for client ID: ${clientId}`);
    try {
        const response = await fetch(`http://localhost:5000/patients/${clientId}/images`);
        if (!response.ok) {
            console.error('Error fetching images:', response.statusText);
            alert("Error fetching images.");
            return;
        }

        const images = await response.json();
        const imagesContainer = document.getElementById('clientPhotos');
        imagesContainer.innerHTML = '';

        if (images.length > 0) {
            images.forEach(image => {
                const link = document.createElement('a');
                link.href = `/${image.image_path}`;
                link.target = '_blank';
                link.textContent = image.image_name + ' ' + image.image_date;
                imagesContainer.appendChild(link);

                imagesContainer.appendChild(document.createElement('br'));
            });
        } else {
            imagesContainer.innerHTML = '<p>No images found.</p>';
        }
    } catch (error) {
        console.error('Error fetching images:', error);
        alert("Error fetching images.");
    }
}

  
  function goBack() {
    document.getElementById('clientSearchSection').style.display = 'block';
    document.getElementById('clientProfileSection').style.display = 'none';
    window.history.pushState({}, document.title, window.location.pathname);
  }

async function showPictures(clientId) {
    console.log(`Fetching pictures for client ID: ${clientId}`);
    try {
        const response = await fetch(`http://localhost:5000/patients/${clientId}/images`);
        if (!response.ok) {
            console.error('Error fetching images:', response.statusText);
            alert("Error fetching images.");
            return;
        }

        const images = await response.json();
        const imagesContainer = document.getElementById('clientPhotos');
        imagesContainer.innerHTML = '';

        if (images.length > 0) {
            images.forEach(image => {
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = image.image_name;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    openCustomModal(image, clientId);
                });
                imagesContainer.appendChild(link);

                imagesContainer.appendChild(document.createElement('br'));
            });
        } else {
            imagesContainer.innerHTML = '<p>No images found.</p>';
        }
    } catch (error) {
        console.error('Error fetching images:', error);
        alert("Error fetching images.");
    }
}

function openCustomModal(image, clientId) {
    const modal = document.getElementById('customModal');
    modal.style.display = 'block';

    const openButton = document.getElementById('openButton');
    const deleteButton = document.getElementById('deleteButton');
    const cancelButton = document.getElementById('cancelButton');

    openButton.onclick = () => {
        window.open(`/${image.image_path}`, '_blank');
        closeModal();
    };

    deleteButton.onclick = () => {
        deleteImage(image.id, clientId);
        closeModal();
    };

    cancelButton.onclick = () => {
        closeModal();
    };
}

function closeModal() {
    const modal = document.getElementById('customModal');
    modal.style.display = 'none';
}

async function deleteImage(imageId, clientId) {
    if (confirm('Are you sure you want to delete this image?')) {
        try {
            const response = await fetch(`http://localhost:5000/images/${imageId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('Image deleted successfully!');
                // Refresh the image list
                showPictures(clientId);
            } else {
                alert('Error deleting image.');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Error deleting image.');
        }
    }
}



function openImage(imagePath) {
    window.open(`/${imagePath}`, '_blank');
}


  