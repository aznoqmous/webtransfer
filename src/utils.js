export default class Utils {
     static humanDuration (tstamp){
        const result = []
        const hours = Math.floor(tstamp / 3600)
        tstamp -= hours * 3600
        if(hours) result.push(hours + "h")
    
        const minutes = Math.floor(tstamp / 60)
        tstamp -= minutes * 60
        if(minutes) result.push(minutes + "m")
        
        result.push(Math.floor(tstamp) + "s")
    
        return result.join(' ')
    }

    static humanFileSize(size){
        return Intl.NumberFormat("en", {
          notation: "compact",
          style: "unit",
          unit: "byte",
          unitDisplay: "narrow",
        }).format(size)
      }
}