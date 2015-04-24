angular.module('flapperNews', ['ui.router', 'templates', 'Devise'])

.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider){

    $stateProvider

    .state('home', {
      url: '/home',
      templateUrl: 'home.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['posts', function(posts){
          return posts.getAll();
        }]
      }
    })

     .state('posts', {
      url: '/posts/{id}',
      templateUrl: 'posts.html',
      controller: 'PostsCtrl',
      resolve: {
        post: ['$stateParams', 'posts', function($stateParams, posts){
          return posts.get($stateParams.id)
        }]
      }
    });

    $urlRouterProvider.otherwise('home');
  }])

.factory('posts', ['$http', function($http){

  var o ={
    posts: []
  };

  o.getAll = function(){
    return $http.get('/posts.json').success(function(data){
      console.log(data)
      angular.copy(data, o.posts)
    });
  };

  o.create = function(post){
    return $http.post('/posts.json', post).success(function(data){
      o.posts.push(data);
    });
  };

  o.upvote = function(post){
    return $http.put('/posts' + post.id + '/upvote.json')
    .success(function(data){
      post.upvotes += 1;
    });
  };

  o.get = function(id){
    return $http.get('/posts/' + id + '.json').then(function(res){
      return res.data;
    });
  };

  o.addComment = function(id, comment){
    return $http.post('/posts/' + id + '/comments.json', comment);
  };

  o.upvoteComment = function(post, comment){
    return $http.put('/posts/' + post.id + '/comments/' + comment.id + '/upvote.json').success(function(data){
      comment.upvotes += 1;
    });
  };

  return o;

}])

.controller('MainCtrl', ['$scope', 'posts', function($scope, posts){

  $scope.posts = posts.posts;

  $scope.addPost = function(){
    if(!$scope.title || $scope.title === ''){return;}
    posts.create({
      title: $scope.title,
      link: $scope.link,
      upvotes: 0,
      comments: [
      {author: 'Joe', body: 'Cool post!', upvotes: 0},
      {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
      ]
    });
    $scope.title = '';
    $scope.link = '';
  };

  $scope.incrementUpvotes = function(post){
    post.upvote(post)
  }

  }])

  .controller('PostsCtrl', ['$scope', 'posts' , 'post', function($scope, posts, post){

    $scope.post = post;

    $scope.incrementUpvotes = function(comment){
      posts.upvoteComment(post, comment)
    };

    $scope.addComment = function(){
      if($scope.body === ''){ return; }
      $scope.post.comments.push({
        body: $scope.body,
        author: 'user'
        }).success(function(comment){
          $scope.post.comments.push(comment);
      });
      $scope.body = '';
    };

  }]);