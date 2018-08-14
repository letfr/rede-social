var database = firebase.database();
const USER_ID = getUserId();

$(document).ready(function () {
  getUserPostsFromDB();
  $(".btn-post").on("click", addPost);
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
  let content = `<div class="box"><p>${text}</p><button class="edit btn-warning" data-id=${key}>EDITAR<i class="icon-pencil"></i></button><button class="delete btn-danger" data-id=${key}>DELETAR<i class="icon-trash"></i></button></div>`;
  $('.posts').prepend(content);

  $(`.delete[data-id='${key}']`).click(function () {
    var p = $(this).parent();
    deletePost(p, key);
  });

  $(`.edit[data-id='${key}']`).click(inputEditPost);
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
function inputEditPost(){
  $(this).parent().append(`<textarea class="posts-input edit-input" type="text" rows="4"></textarea>`)
}
function editPost() {
  var postData = {
    text: text
  };

  var newPostKey = firebase.database().ref().child('posts').push().key;

  var updates = {};
  updates['/posts/' + newPostKey] = postData;
  updates['/user-posts/' + uid + '/' + newPostKey] = postData;
  return firebase.database().ref().update(updates);

}