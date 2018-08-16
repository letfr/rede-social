var database = firebase.database();
const USER_ID = getUserId();

$(document).ready(function () {
  getUserPostsFromDB();
  $(".btn-post").on("click", addPost);
  friendsPosts();
  users();
  wineOption();
  // for ( wine of db ) { $("body").append(`<img src="${wine.url}" width="100") >`)};
})

function getUserId() {
  var queryString = window.location.search;
  var regExpForUserId = new RegExp(/\?userId=(.+)/);
  return queryString.match(regExpForUserId)[1];
}
function getUserPostsFromDB() {
  database.ref('posts/' + USER_ID).once('value')
    .then(function (snapshot) {
      renderPostsList(snapshot);
    });
}
function renderPostsList(snapshot) {
  snapshot.forEach(function (childSnapshot) {
    var post = childSnapshot.val();
    createPostItem(post.text, childSnapshot.key, post.wine);
  });
}
function createPostItem(text, key, wine) {
  let content = `<div class="box"><h2 data-id=${key}>${wine}</h2><p class="post-text" data-id=${key}>${text}</p><button class="edit btn-warning icon-pencil" data-id=${key}>EDITAR</button><button class="delete btn-danger icon-trash" data-id=${key}>DELETAR</button></div>`;
  $('.posts').prepend(content);

  $(`.delete[data-id='${key}']`).click(function () {
    var p = $(this).parent();
    deletePost(p, key);
  });

  $(`.edit[data-id='${key}']`).click(function () {
    $(this).parent().append(`<textarea class="posts-input edit-input" type="text" rows="4"></textarea><button class="save-changes btn-warning icon-download" data-id="${key}">ATUALIZAR</button>`);
    $(this).off('click');

    $(`.save-changes[data-id='${key}']`).click(function () {
      var changed = $(".edit-input").val();
      editPost(changed, key);
      $(`.post-text[data-id=${key}]`).text(changed);
      $(".edit-input").hide();
      $(this).hide();
    });
  });
}
function deletePost(p, key) {
  deletePostFromDB(key);
  p.remove();
}
function deletePostFromDB(key) {
  database.ref(`posts/${USER_ID}/${key}`).remove();
}
function addPost(event) {
  event.preventDefault();
  const postInput = $(".posts-input").val();
  let inputValue = $("#inputState").val();
  let wineName = $("#wines").val();
  let isTextEmpty = postInput === "";
  if (!isTextEmpty) {
    var newPost = addPostToDB(postInput, inputValue, wineName);
    var postId = newPost.getKey();
    createPostItem(postInput, postId, wineName);
  }
  $(".posts-input").val("");
}
function addPostToDB(text, filter, wine) {
  return database.ref('posts/' + USER_ID).push({ text: text, filter: filter , wine: wine});
}
function editPost(changed, key) {
  var postData = {
    text: changed
  };
  var newPostKey = firebase.database().ref().child('posts').push().key;
  return firebase.database().ref(`posts/${USER_ID}/${key}`).update(postData);
}
function changePost(changed, key) {
  $(`.post-text[data-id=${key}]`).val(changed);
  let value = $(`.post-text[data-id=${key}]`).val();
  console.log(key);
}
function friendsPosts() {
  database.ref('posts/').once('value')
    .then(snapshot => {
      snapshot.forEach(function (childSnapshot) {
        //filtro do post
        childSnapshot.forEach(child => {
          if (child.val().filter === "todos" || child.val().filter === "amigos") {
            let content = `<div class="box"><h2 data-id=${childSnapshot.key}>${child.val().wine}</h2><p class="post-text" data-id=${childSnapshot.key}>${child.val().text}</p></div>`;
            $('.posts').append(content);
          }
        })
      })
    })
}
// nome usuario
function users(){
  database.ref('users/').once('value')
    .then(snapshot => {
      snapshot.forEach(childSnapshot => {
        $(".btn-friends").click(function () {
          $(this).off('click');
          $("#friends").append(`
          <ul>
            <li href="#" class="ml-3 list-users" data-toggle="modal" data-target="#modalFriends">${childSnapshot.val().name}</li>
          </ul>
          `);
        })
      })
    })
  }

  function createUsers(name, key) {
    if (key !== USER_ID) {
      $("#friends-body").append(`<span>${name}</span>`);
      $("#friends-footer").append('<button data-user-id="${key}">seguir</button>');
    }
  
    $(`button[data-user-id=${key}]`).click(function () {
      database.ref('friendship/' + USER_ID).push({
        friendId: key
      });
    })
  }

function wineOption(){
  for ( wine of db ) { 
    $("#wines").append(`<option value="${wine.wine}">${wine.wine}</option>`)
  }
}