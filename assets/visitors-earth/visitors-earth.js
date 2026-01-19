document.addEventListener("DOMContentLoaded", () => {
    const earthWidget = document.querySelector(".visitors-earth-widget");
    if (!earthWidget) return;
  
    const counterEl = earthWidget.querySelector(".visitors-counter");
    const flagsContainer = earthWidget.querySelector(".visitors-flags-container");
    const globeContainer = earthWidget.querySelector(".visitors-globe");
  
    // ---------------------------------------------------------
    // ASCII GLOBE SETUP
    // ---------------------------------------------------------
  
    const output = document.createElement("pre");
    output.id = "output";
    output.style.margin = "0";
    output.style.position = "absolute";
    output.style.top = "50%";
    output.style.left = "50%";
    output.style.fontFamily = "'Courier New', monospace";
    output.style.textAlign = "center";
    output.style.transform = "translate(-50%, -50%)";
    globeContainer.appendChild(output);
  
    const cols = 60;
    const rows = 60;
    const charAspect = 0.59995;
  
    let angle = 0;
  
    // ---------------------------------------------------------
    // WORLD MAP MASK
    // ---------------------------------------------------------
  
    const worldMap = `
                                                                                                    
                                                                                                    
                                                           #### .#########                                                       
                      :      -##     ########                       +#####                            
          ############  . +### ##    ######          ######  ##### ##########################:        
       ###################   # #    ##             ### ########################################       
      #      ############   ####:              *   ##  ###############################     ##         
             ###################*             = ########################################:             
            :###########+######                 #########+# ### #########################             
           ################                   ###  # ###+######  #######################              
           ##############                       ####      .+#########################- # ###          
            ####### --#                      ##########################################               
             *###                          -##################### #+++################                
               ##* #   . #                 ########################     ####  ######                  
                  -##                      #####################        -##     ####   #              
                     ########               #####################        #      # +   + #-            
                       ########*             #*    #############                ##    #               
                      ############                 ###########                   #  #####  #          
                      ###############                ########                      *         -##:#    
                       #############                 ########                                         
                        .###########                #########  #                      ##### #         
                          #########                  #######  ##                    ##########        
                          #######                    ######                        ############       
                          ######                      ####                         ###########        
                          #####                                                          ###:         
                           ##                                                                    -*   
                           ##                                                                         
                             #                                                                        
                                                                                                      
                                                                                                      
                                                                
                                                                                                    
                                                                                                    
    `;
  
    const mapLines = worldMap
      .split("\n")
      .map(line => line.replace(/\r/g, ""))
      .filter(line => line.length > 0);
  
    const mapHeight = mapLines.length;
    const mapWidth = mapLines[0] ? mapLines[0].length : 0;
  
    function isLandFromMap(lat, lon) {
      const B = lat;
      const L = lon;
  
      let x = (L + Math.PI) / (2 * Math.PI);   // 0..1
      let y = (Math.PI / 2 - B) / Math.PI;     // 0..1
  
      x = x * (mapWidth - 1);
      y = y * (mapHeight - 1);
  
      const ix = Math.round(x);
      const iy = Math.round(y);
  
      if (ix < 0 || ix >= mapWidth || iy < 0 || iy >= mapHeight) return false;
  
      const ch = mapLines[iy][ix];
      return ch === "#";
    }
  
    // ---------------------------------------------------------
    // RENDER GLOBE
    // ---------------------------------------------------------
  
    function renderGlobe() {
      let result = "";
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
  
      for (let j = 0; j < rows; j++) {
        const v = (j / (rows - 1)) * 2 - 1;
  
        for (let i = 0; i < cols; i++) {
          const u = (i / (cols - 1)) * 2 - 1;
          const nx = u;
          const ny = v / charAspect;
          const r2 = nx * nx + ny * ny;
  
          if (r2 > 1) {
            result += " ";
            continue;
          }
  
          const nz = Math.sqrt(1 - r2);
          const rx = nx * cosA - nz * sinA;
          const rz = nx * sinA + nz * cosA;
  
          const lat = Math.asin(-ny);
          const lon = Math.atan2(rx, rz);
  
          const land = isLandFromMap(lat, lon);
          result += land ? "#" : " ";
        }
        result += "\n";
      }
  
      output.textContent = result;
      angle += 0.01;
      requestAnimationFrame(renderGlobe);
    }
  
    renderGlobe();
  
    // ---------------------------------------------------------
    // FLAGS BURST / VISITOR COUNTER (unchanged)
    // ---------------------------------------------------------
  
    const flags = [
      "🇺🇸","🇬🇧","🇨🇦","🇦🇺","🇫🇷","🇩🇪","🇯🇵","🇧🇷","🇮🇳","🇰🇷",
      "🇦🇪","🇦🇱","🇦🇲","🇦🇴","🇦🇷","🇦🇹","🇦🇿","🇧🇦","🇧🇧","🇧🇩"
    ];
  
    function burstFlags(count = 10) {
      const widgetRect = earthWidget.getBoundingClientRect();
      const globeRect = globeContainer.getBoundingClientRect();
      const globeCenterX = globeRect.left - widgetRect.left + globeRect.width / 2;
      const globeCenterY = globeRect.top - widgetRect.top + globeRect.height / 2;
      const radius = globeRect.width / 2;
  
      for (let i = 0; i < count; i++) {
        const flagEl = document.createElement("div");
        flagEl.className = "flag-burst";
        flagEl.textContent = flags[Math.floor(Math.random() * flags.length)];
  
        const theta = Math.random() * Math.PI * 2;
        const r = radius * Math.sqrt(Math.random());
        const x = globeCenterX + r * Math.cos(theta);
        const y = globeCenterY + r * Math.sin(theta);
  
        flagEl.style.left = `${x}px`;
        flagEl.style.top = `${y}px`;
  
        const burstAngle = Math.random() * Math.PI * 2;
        const distance = 60 + Math.random() * 40;
        flagEl.style.setProperty("--x", `${Math.cos(burstAngle) * distance}px`);
        flagEl.style.setProperty("--y", `${Math.sin(burstAngle) * distance}px`);
  
        flagsContainer.appendChild(flagEl);
        flagEl.addEventListener("animationend", () => flagEl.remove());
      }
    }
  
    let visitorCount = 0;
  
    function newVisitor() {
      visitorCount++;
      counterEl.textContent = visitorCount.toLocaleString();
      burstFlags(10);
    }
  
    setInterval(newVisitor, 3000);
  
    const handleViewportBurst = () => {
      const rect = earthWidget.getBoundingClientRect();
      const windowHeight = window.innerHeight;
  
      if (rect.top < windowHeight && rect.bottom > 0 && !earthWidget.dataset.bursted) {
        earthWidget.dataset.bursted = true;
        burstFlags(50);
      }
    };
  
    window.addEventListener("scroll", handleViewportBurst);
    window.addEventListener("resize", handleViewportBurst);
    handleViewportBurst();
  });
  