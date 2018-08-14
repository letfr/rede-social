var database = firebase.database();
var USER_ID = getUserId();

function getUserId() {
  var queryString = window.location.search;
  var regExpForUserId = new RegExp(/\?userId=(.+)/);
  return queryString.match(regExpForUserId)[1];
}

$(document).ready(function () {
  $(".btn-post").on("click", addPost);
})
function addPost(){
  let postInput = $(".posts-input").val();
  let isTextEmpty = postInput === "";
  if (!isTextEmpty) {
    var newPost = addPostToDB(postInput);
    var postId = newPost.getKey();
    createPostItem(postInput, postId, postInput);
  }
  $(".posts-input").val("");
}
function createPostItem(text, key, postInput) {
  let content = `<div class="box"><p data-id=${key}>${postInput}</p></div>`;
  $('.posts').prepend(content);
}

function addPostToDB(text) {
  return database.ref('posts/' + USER_ID).push({ text: text });
}