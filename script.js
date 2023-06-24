var db = new PouchDB("lastFiles");
var lineId = 2;

function $(elem) {
	var type=typeof(elem);
	if (type=="string") {
		return document.getElementById(elem);
	}
	return elem;
}

function init() {

    if(typeof($("newLine")) != 'undefined' && $("newLine") != null) {
        var newLine = $("newLine");

        newLine.addEventListener('click', () => {
            let lineTable = $("lines");
            let tr = document.createElement("TR");
            let label = document.createElement("LABEL");
            let labelText = document.createTextNode("Ligne " + ++lineId);
            label.appendChild(labelText);
            let textarea = document.createElement("TEXTAREA");
            textarea.id = "line" + lineId;
            tr.appendChild(label);
            tr.appendChild(textarea);
            lineTable.appendChild(tr);
        });
    }

    if(typeof($("seeResult")) != 'undefined' && $("seeResult") != null) {
        var seeResult = $("seeResult");

        seeResult.addEventListener('click', () => {
                        
            if(!(!window.screenTop && !window.screenY)) {
                alert('Pour une meilleure qualité il est recommandé d\'être en plein écran.')
            }

            var allLines = document.querySelectorAll("textarea");
            var linesTable = $("linesTable");
            linesTable.innerHTML = "";

            for(let i = 0; i < allLines.length; i++) {
                if(allLines[i].value.length > 0) {
                    let tr = document.createElement("TR");
                    let td = document.createElement("TD");
                    let tdText = document.createTextNode(allLines[i].value);
                    td.appendChild(tdText);
                    tr.appendChild(td);
                    linesTable.appendChild(tr);
                }
            }

            var modal = document.getElementById("seeResultModal");
            var span = document.getElementsByClassName("close")[0];
            modal.style.display = "block";

            span.onclick = function() {
                modal.style.display = "none";
            }

            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
        });
    }

    if(typeof($("saveResult")) != 'undefined' && $("saveResult") != null) {
        
        $("saveResult").addEventListener('click', () => {
            var pdf = new jsPDF({
                orientation: "landscape",
                unit: 'mm',
                format: 'a4'
            });

            var allLines = document.querySelectorAll("textarea");
            var allLinesForDB = new Array();
            var j = 205;
            
            pdf.text(0, j - (allLines.length * 10), '__________________________________________________________________________________________________');
            pdf.setFontSize(12);

            for(let i = allLines.length - 1; i >= 0; i--) {
                if(allLines[i].value.length > 0) {
                    allLinesForDB.push(allLines[i].value);
                    xOffset = (pdf.internal.pageSize.width / 2) - (pdf.getTextWidth(allLines[i].value) / 2); 
                    pdf.text(allLines[i].value, xOffset, j);
                    j -= 10;
                }
            }

            pdf.save('sheet.pdf');
           
            var files = {
                _id: new Date().toISOString(),
                lines: allLinesForDB
            };
            db.put(files, function callback(err, result) {
                if (!err) {
                    console.log('Successfully posted a file!');
                }
            });

            displayDBInfo();

            allLinesForDB = new Array();
        });
    }

    if(typeof($("resetSheet")) != 'undefined' && $("resetSheet") != null) {

        $("resetSheet").addEventListener('click', () => {

            if(confirm("Vous êtes sur le point de réinitialiser la feuille en cours.")) {
                document.location.reload();
            }
        });
    }

    displayDBInfo();
}

function displayDBInfo() {
    
    db.allDocs({include_docs: true, descending: true}).then(function (result) {
        var lastFiles = $("lastFiles");
        lastFiles.querySelectorAll('*').forEach(n => n.remove());

        console.log(result);
        for(let i = 0; i < result.rows.length; i++) {
            var p = document.createElement("p");
            var pText = document.createTextNode(dateToString(result.rows[i]["id"]));
            
            p.addEventListener('click', () => {
                console.log(result.rows[i]["id"]);

                lineId = 2;

                var allLines = $("lines");
                allLines.querySelectorAll('*').forEach(n => n.remove());
                
                var lineTable = $("lines");

                let len = result.rows[i]["doc"]["lines"].length - 1;
                
                $("line1").value = result.rows[i]["doc"]["lines"][len];
                $("line2").value = result.rows[i]["doc"]["lines"][len - 1];
                
                
                for(let j = len - 2; j >= 0; j--) {
                    
                    let tr = document.createElement("TR");
                    let label = document.createElement("LABEL");
                    let labelText = document.createTextNode("Ligne " + ++lineId);
                    label.appendChild(labelText);
                    let textarea = document.createElement("TEXTAREA");
                    textarea.value = result.rows[i]["doc"]["lines"][j];
                    textarea.id = "line" + lineId;
                    tr.appendChild(label);
                    tr.appendChild(textarea);
                    lineTable.appendChild(tr);
                }

            });
            
            p.appendChild(pText);
            lastFiles.appendChild(p);
        }
    });
}

function dateToString(rawDate) {
    
    var date = new Date(rawDate);
    var day = String(date.getDate()).padStart(2, '0');
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var year = date.getFullYear();
    var hour = date.getHours();
    var minute = String(date.getMinutes()).length == 2 ? date.getMinutes() : "0" + date.getMinutes();
    return day + '/' + month + '/' + year + " " + hour + ":" + minute;
}

window.onload = init;