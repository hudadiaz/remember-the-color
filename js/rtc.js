function rtc(){
  var self = this;

  this.is_ready = true;
  this.is_finished = false;
  this.is_paused = false;
  this.points = null;
  this.start_length = null;
  this.start_timer = null;
  this.game_length = null;
  this.game_timer = null;
  this.prev_background = null;
  this.rtcHTML = "<div class='main_block'></div><div class='answer'><div class='left_block'></div><div class='right_block'></div></div>";
  this.rtc = null;
  this.main_block = null;
  this.left_block = null;
  this.right_block = null;
  this.pause_blocker = null;
  this.bar_timer_mark = "<div id='bar4' style='height: 10px;'><span id='bar-timer' display='block' style='width: 100%;'></span></div>";
  this.bar_timer = null;
  this.bar_timer_length = null;
  // this.center_block = null;

  this.init = function() {
    if(!self.is_ready) return false;
    self.is_ready = false;
    this.is_paused = false;
    clearTimeout(self.game_timer);
    clearTimeout(self.start_timer);
    self.points = null;
    self.start_length = 2000;
    self.start_timer = null;
    self.game_length = 60000;
    self.game_timer = null;
    self.prev_background = null;
    self.bar_timer = null;
    self.bar_timer_length = null;

    self.rtc = $(".rtc");
    self.rtc.html(self.rtcHTML);

    // $(document).find("*").unbind();
    
    self.main_block = self.rtc.find(".main_block");
    self.left_block = self.rtc.find(".left_block");
    self.right_block = self.rtc.find(".right_block");
    // self.center_block = self.rtc.find(".center_block");
    self.left_block.click(function(){return false;});
    self.right_block.click(function(){return false;});
    self.left_block.hover(function() {self.left_block.css("cursor", "default")});
    self.right_block.hover(function() {self.right_block.css("cursor", "default")});

    self.startGame();
  }

  this.startGame = function() {
    self.is_finished = false;
    self.points = 0;
    // self.center_block.innerHTML = null;
    var background = self.genColor("rgb(0, 0, 0)");
    self.main_block.css("background", background);
    self.left_block.css("background", background);
    self.right_block.css("background", background);
    self.main_block.html(self.bar_timer_mark);
    self.bar_timer = self.main_block.find("#bar-timer");
    
    self.start_timer = new self.Timer(function() {
      self.is_ready = true;
      self.left_block.click(function(){self.guessLeft()});
      self.right_block.click(function(){self.guessRight()});
      self.left_block.hover(function() {self.left_block.css("cursor", "pointer")});
      self.right_block.hover(function() {self.right_block.css("cursor", "pointer")});
      self.game_timer = new self.Timer(function() {self.endGame()}, self.game_length);
      self.bar_timer.animate({width: "0"}, self.game_length, 'linear')
      self.nextRound();
    }, self.start_length);
  }

  this.nextRound = function(){
    if(!self.is_ready) return false;
    self.is_ready = false;
    self.prev_background = self.getBackgroundRGB(self.main_block.css("background"));
    var new_main_block, ans, i = Math.round(Math.random() * 100);
    
    do{
      new_main_block = self.genColor(self.prev_background);
      ans = self.genColor(new_main_block);
    }while(new_main_block === self.prev_background);

    self.main_block.css("background", new_main_block);
    self.answer = self.prev_background;

    if(i%2 == 1){
      self.left_block.css("background", ans);
      self.right_block.css("background", self.answer);
    }
    else {
      self.left_block.css("background", self.answer);
      self.right_block.css("background", ans);
    }
    
    self.is_ready = true;
  }

  this.pauseGame = function(){
    self.game_timer.pause();
    self.bar_timer.stop();
    self.is_paused = true;
    self.is_ready = false;
  }

  this.resumeGame = function(){
    self.game_timer.resume();
    console.log(self.game_timer.remaining())
    self.bar_timer.animate({width: "0"}, self.game_timer.remaining(), 'linear')
    self.is_paused = false;
    self.is_ready = true;
  }

  this.guessLeft = function(){
    if(!self.is_ready) return false;
    self.guessColor(self.getBackgroundRGB(self.left_block.css("background")));
  }

  this.guessRight = function(){
    if(!self.is_ready) return false;
    self.guessColor(self.getBackgroundRGB(self.right_block.css("background")));
  }

  this.guessColor = function(selection){
    clearTimeout(self.start_timer);
    console.log(self.answer)
    console.log(selection)
    if(self.answer === selection) {
      self.points++;
      self.nextRound();
    }
    else {
      self.endGame();
    }
  }

  this.endGame = function(){
    if(!self.is_ready) return false;
    self.is_ready = false;
    self.is_finished = true;
    clearTimeout(self.game_timer);
    clearTimeout(self.start_timer);
    self.bar_timer.stop();
    var currentScore = window.localStorage['rtc.highscore'] === 'undefined' ? 0 : window.localStorage['rtc.highscore'];
    if(currentScore < self.points){
      window.localStorage['rtc.highscore'] = self.points;
      alert(window.localStorage['rtc.highscore'] + " points, a new highscore!")
    } else {
      alert(self.points + " points!")
    }
  }

  this.genColor = function(reference){
    var ref_rgb = reference.split("(")[1].split(")")[0].split(","), r, g, b;
    for (var i = 0; i < ref_rgb.length; i++) ref_rgb[i] = parseInt(ref_rgb[i]);

    do{
      r = Math.floor(Math.random() * 255) + 1;
      g = Math.floor(Math.random() * 255) + 1;
      b = Math.floor(Math.random() * 255) + 1;
    }while(Math.sqrt((ref_rgb[0]-r)^2+(ref_rgb[1]-g)^2+(ref_rgb[2]-b)^2) < 200);

    return "rgb("+r+", "+g+", "+b+")";
  }

  this.getBackgroundRGB = function(background){
    var ref_rgb = background.split("(")[1].split(")")[0].split(",");
    return "rgb("+ref_rgb[0]+","+ref_rgb[1]+","+ref_rgb[2]+")";
  }

  this.Timer = function(callback, delay) {
    var timerId, start, remaining = delay;

    this.pause = function() {
      window.clearTimeout(timerId);
      remaining -= new Date() - start;
    };

    this.resume = function() {
      start = new Date();
      timerId = window.setTimeout(callback, remaining);
    };

    this.remaining = function() {
      return remaining;
    }
    
    this.resume();
  }
}

var RTC;
$(document).ready(function(){
  RTC = new rtc();
  RTC.init();

  $(document).keydown(function(e) {
    if(!RTC.is_finished){
      if(RTC.is_ready)
        switch(e.which){
        case 39: RTC.guessRight(); break;
        case 37: RTC.guessLeft(); break;
        case 38: RTC.init(); break;
        case 40: RTC.endGame(); break;
      }
      if(e.which == 32)
        switch(RTC.is_paused){
          case true: RTC.resumeGame(); break;
          case false: RTC.pauseGame();
        }
    }
    else {
      switch(e.which){
        case 39:
        case 37:
        case 38:
        case 40:
        case 32: RTC.is_ready = true; RTC.init();
      }
    }
  });
});
