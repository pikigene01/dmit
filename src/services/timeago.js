export const getAppTimeAgo=(date_pass)=>{
       
    // const interval = setInterval(()=>{
        var now = new Date().getTime();
        var date2 = new Date(date_pass).getTime();

        var diff = now - date2;
        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var months = Math.floor(days / 30);
        let years = Math.floor(months / 12);
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        let whole_time = "";
        if(years > 0){
           whole_time = years + " Years Ago";
        }else if(months > 0){
           whole_time = months + " Months Ago";
        }else if(days > 0){
           whole_time = days + " days " + hours + " hrs "+ minutes + " mins";
        }else if(hours > 0){
         whole_time =  hours + " hrs ago";
        }else{
         whole_time =  minutes + " mins ago";
        }
        return whole_time;
    //   },1000);
      
    //  return ()=>{
    //    clearInterval(interval);
    //  }
}