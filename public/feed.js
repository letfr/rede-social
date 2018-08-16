var database = firebase.database();
const USER_ID = getUserId();

$(document).ready(function () {
  getUserPostsFromDB();
  $(".btn-post").on("click", addPost);
  publicPosts();
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
  return database.ref('posts/' + USER_ID).push({ text: text, filter: filter, wine: wine });
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
function publicPosts() {
  let friendshipActive = [];
  database.ref('friendship/').once('value')
    .then(snapshot => {
      snapshot.forEach(childSnapshot => {
        if (childSnapshot.key === USER_ID) {
          childSnapshot.forEach(child => {
            friendshipActive.push(child.val().friendId)
          })
        }
      })
    })
  database.ref('posts/').once('value')
    .then(snapshot => {
      snapshot.forEach(childSnapshot => {
        childSnapshot.forEach(child => {
          if (childSnapshot.key !== USER_ID) {
            // todos
            if (child.val().filter === "todos") {
              createFriendPost(childSnapshot.key, child.val().wine, child.val().text);
            }
            // amigos
            if (friendshipActive.indexOf(childSnapshot.key) >= 0) {
              if (child.val().filter === "amigos") {
                createFriendPost(childSnapshot.key, child.val().wine, child.val().text);
              }
            }
          }
        })
      })
    })
}
function createFriendPost(key, wine, text) {
  let content = `<div class="box"><h2 data-id=${key}>${wine}</h2><p class="post-text" data-id=${key}>${text}</p></div>`;
  $('.posts').append(content);
}

function users() {
  database.ref('users/').once('value')
    .then(snapshot => {
      snapshot.forEach(childSnapshot => {
        $(".btn-friends").click(function () {
          $(this).off('click');
          let key = childSnapshot.key;
          if (key !== USER_ID) {
            $("#friends").append(`
            <ul class="text-center">
              <li href="#" class="ml-3 list-users"><p class="text-dark">${childSnapshot.val().name}</p><a href="#" class="btn-follow text-white" data-user-id="${key}">Seguir</a></li>
            </ul>`);

            $(`.btn-follow[data-user-id=${key}]`).click(function () {
              if ($(this).text() === "Seguir") {
                database.ref('friendship/' + USER_ID).push({ friendId: key });
                $(this).text("Seguindo").css("background-color", "green").off("click");
              }
            })
          }
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

function wineOption() {
  for (wine of db) {
    $("#wines").append(`<option value="${wine.wine}">${wine.wine}</option>`)
  }
}