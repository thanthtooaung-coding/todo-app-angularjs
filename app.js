var app = angular.module('taskManager', ['ngRoute']);

// Routing
app.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'home.html',
        controller: 'HomeController'
    })
    .when('/stats', {
        templateUrl: 'stats.html',
        controller: 'StatsController'
    })
    .when('/about', {
        templateUrl: 'about.html',
        controller: 'AboutController'
    })
    .otherwise({redirectTo: '/'});
});

// Services
app.service('TaskService', function() {
    var tasks = [
        {id: 1, name: 'Learn AngularJS', completed: false, category: 'Work', priority: 'high', dueDate: '2023-06-30'},
        {id: 2, name: 'Build an app', completed: false, category: 'Personal', priority: 'medium', dueDate: '2023-07-15'}
    ];

    var categories = ['Work', 'Personal', 'Shopping', 'Health'];

    this.getTasks = function() {
        return tasks;
    };

    this.getCategories = function() {
        return categories;
    };

    this.addTask = function(task) {
        tasks.push({
            id: tasks.length + 1,
            name: task.name,
            completed: false,
            category: task.category,
            priority: task.priority,
            dueDate: task.dueDate
        });
    };

    this.toggleComplete = function(task) {
        console.log(task);
        // task.completed = !task.completed;
        console.log(task);
    };

    this.deleteTask = function(task) {
        var index = tasks.indexOf(task);
        if (index > -1) {
            tasks.splice(index, 1);
        }
    };

    this.getStats = function() {
        var stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
            pending: tasks.filter(t => !t.completed).length,
            categories: {}
        };

        tasks.forEach(task => {
            if (stats.categories[task.category]) {
                stats.categories[task.category]++;
            } else {
                stats.categories[task.category] = 1;
            }
        });

        return stats;
    };
});

// Controllers
app.controller('HomeController', function($scope, TaskService) {
    $scope.tasks = TaskService.getTasks();
    $scope.categories = TaskService.getCategories();
    
    $scope.addTask = function(newTask) {
        if (newTask && newTask.name) {
            TaskService.addTask(newTask);
            $scope.newTask = {};
        }
    };

    $scope.toggleComplete = function(task) {
        TaskService.toggleComplete(task);
    };

    $scope.deleteTask = function(task) {
        TaskService.deleteTask(task);
    };

    $scope.editTask = function(task) {
        $scope.editingTask = angular.copy(task);
        $('#editTaskModal').modal('show');
    };

    $scope.updateTask = function() {
        var index = $scope.tasks.findIndex(t => t.id === $scope.editingTask.id);
        if (index !== -1) {
            $scope.tasks[index] = $scope.editingTask;
        }
        $('#editTaskModal').modal('hide');
    };
});

app.controller('StatsController', function($scope, TaskService) {
    $scope.stats = TaskService.getStats();
});

app.controller('AboutController', function($scope) {
    $scope.message = 'This is an enhanced demo of AngularJS features.';
});

// Directives
app.directive('taskItem', function() {
    return {
        restrict: 'E',
        scope: {
            task: '=',
            onToggle: '&',
            onDelete: '&'
        },
        template: `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <input type="checkbox" ng-model="task.completed" ng-change="onToggle({task: task})">
                    <span ng-class="{completed: task.completed}">{{task.name}}</span>
                </div>
                <div>
                    <span class="badge bg-info me-2">{{task.category}}</span>
                    <span class="badge me-2" ng-class= "'bg-'+ task.priority + '-priority'">{{task.priority}}</span>
                    <span class="badge bg-secondary me-2">{{task.dueDate | date:'MMM d, y'}}</span>
                    <button class="btn btn-danger btn-sm" ng-click="onDelete()">Delete</button>
                </div>
            </div>
        `
    };
});

// Filters
app.filter('capitalize', function() {
    return function(input) {
        return input.charAt(0).toUpperCase() + input.slice(1);
    };
});

// Form validation
app.directive('taskForm', function() {
    return {
        restrict: 'E',
        template: `
            <form name="taskForm" ng-submit="submit()" novalidate>
                <div class="mb-3">
                    <input type="text" class="form-control" ng-model="newTask.name" name="taskName" required minlength="3" placeholder="Task name">
                    <div class="text-danger" ng-show="taskForm.taskName.$error.required && taskForm.taskName.$touched">
                        Task name is required.
                    </div>
                    <div class="text-danger" ng-show="taskForm.taskName.$error.minlength">
                        Task name must be at least 3 characters long.
                    </div>
                </div>
                <div class="mb-3">
                    <select class="form-select" ng-model="newTask.category" required>
                        <option value="">Select Category</option>
                        <option ng-repeat="category in categories" value="{{category}}">{{category}}</option>
                    </select>
                </div>
                <div class="mb-3">
                    <select class="form-select" ng-model="newTask.priority" required>
                        <option value="">Select Priority</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <div class="mb-3">
                    <input type="date" class="form-control" ng-model="newTask.dueDate" required>
                </div>
                <button type="submit" class="btn btn-primary" ng-disabled="taskForm.$invalid">Add Task</button>
            </form>
        `,
        scope: {
            onAddTask: '&',
            categories: '='
        },
        controller: function($scope) {
            $scope.newTask = {};
            $scope.submit = function() {
                if ($scope.taskForm.$valid) {
                    $scope.onAddTask({ newTask: $scope.newTask });
                    $scope.newTask = {};
                    $scope.taskForm.$setPristine();
                    $scope.taskForm.$setUntouched();
                }
            };
        }
    };
});

