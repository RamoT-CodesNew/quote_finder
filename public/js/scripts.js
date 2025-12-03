let authorLinks = document.querySelectorAll("a");

for (let authorLink of authorLinks) {
  authorLink.addEventListener("click", getAuthorInfo);
}

async function getAuthorInfo(e) {
  e.preventDefault();
  let url = `/api/author/${this.id}`;
  let response = await fetch(url);
  let data = await response.json();

  if (!data[0]) {
    return;
  }

  let author = data[0];
  let authorInfo = document.querySelector("#authorInfo");
  authorInfo.innerHTML = `<h2>${author.firstName} ${author.lastName}</h2>`;
  if (author.portrait) {
    authorInfo.innerHTML += `<img src="${author.portrait}" width="200"><br>`;
  }
  if (author.dob) {
    authorInfo.innerHTML += `<p>Born: ${new Date(author.dob).toLocaleDateString()}</p>`;
  }
  if (author.dod) {
    authorInfo.innerHTML += `<p>Died: ${new Date(author.dod).toLocaleDateString()}</p>`;
  }
  if (author.country) {
    authorInfo.innerHTML += `<p>Country: ${author.country}</p>`;
  }
  if (author.biography) {
    authorInfo.innerHTML += `<p>${author.biography}</p>`;
  }

  let myModal = new bootstrap.Modal(document.getElementById("authorModal"));
  myModal.show();
}
