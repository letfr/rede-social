var database = firebase.database();
const USER_ID = getUserId();

$(document).ready(function () {
  getUserPostsFromDB();
  $(".btn-post").on("click", addPost);

  fetch("https://api.globalwinescore.com/globalwinescores/latest/?limit=20", {
    method: "GET",  
    headers: {
      Accept: "application/json",
      Authorization: "Token 77c4af878d9b673d7b80f4eee09f044f79d0152f"
    }
  })
    .then(response => response.json())
    .then(data => console.log(data));
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
    createPostItem(post.text, childSnapshot.key);
  });
}
function createPostItem(text, key) {
  let content = `<div class="box"><p>${text}</p><button class="edit" data-id=${key}>EDITAR</button><button class="delete" data-id=${key}>DELETAR</button></div>`;
  $('.posts').prepend(content);

  $(`.delete[data-id='${key}']`).click(function () {
    var p = $(this).parent();
    deletePost(p, key);
  });

  $(`.edit[data-id='${key}']`).click(inputEditPost);
  $('.save-changes').click(editPost($('.edit-input').val()));
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
  let isTextEmpty = postInput === "";
  if (!isTextEmpty) {
    var newPost = addPostToDB(postInput);
    var postId = newPost.getKey();
    createPostItem(postInput, postId);
  }
  $(".posts-input").val("");
}
function addPostToDB(text) {
  return database.ref('posts/' + USER_ID).push({ text: text });
}
function inputEditPost() {
  $(this).off('click');
  $(this).parent().append(`<textarea class="posts-input edit-input" type="text" rows="4"></textarea><button class="save-changes">ATUALIZAR</button>`)
}
function editPost(changed) {
  var postData = {
    text: changed
  };

  var newPostKey = firebase.database().ref().child('posts').push().key;

  var updates = {};
  updates['/posts/' + USER_ID] = postData;
  return firebase.database().ref().update(updates);

}