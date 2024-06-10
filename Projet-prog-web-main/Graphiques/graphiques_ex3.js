d3.csv("http://data.insideairbnb.com/france/ile-de-france/paris/2023-12-12/visualisations/listings.csv").then(data => {
    // Transformation des données
    data.forEach(d => {
        // Séparation des différentes informations dans la colonne "name"
        const nameParts = d.name.split(" · ");
        
        // Assignation des informations aux nouvelles colonnes
        d.property_type = nameParts[0];
        d.rating = parseFloat(nameParts[1].replace("★", ""));
        d.bedrooms = parseInt(nameParts[2]);
        d.beds = parseInt(nameParts[3]);
        d.bathrooms = parseInt(nameParts[4]);

        // Conversion des types de données si nécessaire
        d.id = parseInt(d.id);
        d.host_id = parseInt(d.host_id);
        d.latitude = parseFloat(d.latitude);
        d.longitude = parseFloat(d.longitude);
        d.price = parseFloat(d.price);
        d.minimum_nights = parseInt(d.minimum_nights);
        d.number_of_reviews = parseInt(d.number_of_reviews);
        d.last_review = new Date(d.last_review);
        d.reviews_per_month = parseFloat(d.reviews_per_month);
        d.calculated_host_listings_count = parseInt(d.calculated_host_listings_count);
        d.availability_365 = parseInt(d.availability_365);
        d.number_of_reviews_ltm = parseInt(d.number_of_reviews_ltm);
    });
     // Création du premier graphique
     var svg = d3.select("#graph")
     .append("svg")
     .attr("width", 400)
     .attr("height", 300);
 
 var margin = {top: 20, right: 30, bottom: 30, left: 40};
 var width = +svg.attr("width") - margin.left - margin.right;
 var height = +svg.attr("height") - margin.top - margin.bottom;
 
 var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
 var y = d3.scaleLinear().rangeRound([height, 0]);
 
 var g = svg.append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
 x.domain(data.map(function(d) { return d.room_type; }));
 y.domain([0, d3.max(data, function(d) { return d.price; })]);
 
 // Création d'une échelle de couleurs
 var colorScale = d3.scaleOrdinal()
     .domain(data.map(function(d) { return d.room_type; }))
     .range(d3.schemeCategory10);
 
 g.append("g")
     .attr("class", "axis axis--x")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x));
 
 g.append("g")
     .attr("class", "axis axis--y")
     .call(d3.axisLeft(y).ticks(10, "s"))
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", "0.71em")
     .attr("text-anchor", "end")
     .text("Price");
 
 g.selectAll(".bar")
     .data(data)
     .enter().append("rect")
     .attr("class", "bar")
     .attr("x", function(d) { return x(d.room_type); })
     .attr("y", function(d) { return y(d.price); })
     .attr("width", x.bandwidth())
     .attr("height", function(d) { return height - y(d.price); })
     .attr("fill", function(d) { return colorScale(d.room_type); });

 var type_modalites = data.map(function(d) { return d.room_type; });
 var prices = data.map(function(d) { return d.price; });
 var price_min = d3.min(prices);
 var price_max = d3.max(prices);
 var qt2num = d3.scaleLinear()
     .domain([price_min, price_max])
     .range([0, 100]);
 var qt2col = d3.scaleLinear()
     .domain([price_min, price_max])
     .range(["lightgreen", "steelblue"]);
 var ql2num = d3.scaleBand()
     .domain([...type_modalites, "Other type"])
     .range([0, 100]);
 var ql2col = d3.scaleOrdinal(d3["schemeSet1"])
     .domain(type_modalites);
     
 var tbody = d3.select("#tab").selectAll("tr")
     .data(data)
     .enter().append("tr")
     .html(function(d) {
         var chaine = `<td>${d.room_type}</td>
             <td>${ql2num(d.room_type)}</td>
             <td style="background-color:${ql2col(d.room_type)}"></td><td></td>
             <td>${d.price}</td>
             <td>${qt2num(d.price)}</td>
             <td style="background-color:${qt2col(d.price)}"></td>`;
         return chaine;
     });

 // Données pour le deuxième graphique
 const graphData = [
     { type: "Entire home/apt", price: d3.mean(data.filter(d => d.room_type === "Entire home/apt" && typeof d.price === 'number'), d => d.price) },
     { type: "Private room", price: d3.mean(data.filter(d => d.room_type === "Private room" && typeof d.price === 'number'), d => d.price) },
     { type: "Shared room", price: d3.mean(data.filter(d => d.room_type === "Shared room" && typeof d.price === 'number'), d => d.price) },
     { 
         type: "Other type", 
         price: d3.mean(
             data.filter(d => !["Entire home/apt", "Private room", "Shared room"].includes(d.room_type) && typeof d.price === 'number' && !isNaN(d.price)), 
             d => d.price
         ) 
     }
 ];

 const minPrice2 = d3.min(graphData.map(d => d.price));
 const maxPrice2 = d3.max(graphData.map(d => d.price));

 // Echelles pour les prix numériques et les couleurs pour le deuxième graphique
 const priceScale2 = d3.scaleLinear()
     .domain([minPrice2, maxPrice2])
     .range([0, 100]);

 const colorScale2 = d3.scaleLinear()
     .domain([minPrice2, maxPrice2])
     .range(["lightgreen", "steelblue"]);

 // Création de la division avec l'ID "graph2"
 d3.select("body").append("div")
     .attr("id", "graph2");

 // Définition du HTML pour le deuxième graphique
 const htmlGraph2 = `
     <table id="graph2">
         <tr>
             <th colspan="3">Type</th>
             <th colspan="3">Price</th>
         </tr>
         <tr>
             <th colspan="3">(qualitatif)</th>
             <th colspan="3">(quantitatif)</th>
         </tr>
         <tr>
             <th>Original</th>
             <th>Numérique</th>
             <th>Couleur</th>
             <th>Original</th>
             <th>Numérique</th>
             <th>Couleur</th>
         </tr>
         ${graphData.map(d => `
             <tr class="data-row">
                 <td>${d.type}</td>
                 <td>${ql2num(d.type)}</td>
                 <td style="background-color:${ql2col(d.type)}"></td>
                 <td>${d.price.toFixed(0)}</td>
                 <td>${priceScale2(d.price).toFixed(2)}</td>
                 <td style="background-color:${colorScale2(d.price)}"></td>
             </tr>
         `).join('')}
     </table>
 `;

 // Ajout du HTML du deuxième graphique au document
 document.body.insertAdjacentHTML('beforeend', htmlGraph2);

    // Fonction pour préparer les données pour le pie chart
    function preparePieChartData(data) {
        const roomTypes = {};

        // Compter le nombre de chaque type de chambre
        data.forEach(d => {
            if (roomTypes[d.room_type]) {
                roomTypes[d.room_type]++;
            } else {
                roomTypes[d.room_type] = 1;
            }
        });

        // Convertir en tableau d'objets pour D3
        const pieChartData = Object.keys(roomTypes).map(key => {
            return {
                label: key,
                value: roomTypes[key]
            };
        });

        return pieChartData;
    }

    // Appel de la fonction pour préparer les données et créer le premier pie chart
    createPieChart(preparePieChartData(data));

    // Fonction pour préparer les données pour le deuxième pie chart
    function preparePropertyTypeChartData(data) {
        const propertyTypes = {};
    
        // Regrouper les types de propriétés selon vos spécifications
        data.forEach(d => {
            let propertyType = d.property_type;
            // Si le type de propriété est l'un des types spécifiés, regroupez-le
            if (propertyType.includes("Rental unit")) {
                propertyType = "Rental";
            } else if (propertyType.includes("Loft")) {
                propertyType = "Loft";
            } else if (propertyType.includes("Condo")) {
                propertyType = "Condo";
            } else {
                propertyType = "Autres"; // Toutes les autres propriétés
            }
    
            // Incrémenter le compteur pour le type de propriété
            if (propertyTypes[propertyType]) {
                propertyTypes[propertyType]++;
            } else {
                propertyTypes[propertyType] = 1;
            }
        });
    
        // Convertir en tableau d'objets pour D3
        const propertyTypeChartData = Object.keys(propertyTypes).map(key => {
            return {
                label: key,
                value: propertyTypes[key]
            };
        });
    
        // Trier les données selon l'ordre spécifié
        propertyTypeChartData.sort((a, b) => {
            const order = ["Rental unit in Paris", "Loft in Paris", "Condo in Paris", "Autres"];
            return order.indexOf(a.label) - order.indexOf(b.label);
        });
    
        return propertyTypeChartData;
    }

    // Appel de la fonction pour préparer les données du deuxième pie chart
    const propertyTypeData = preparePropertyTypeChartData(data);

    // Création du deuxième pie chart
    createSecondPieChart(propertyTypeData);
});

// Fonction pour créer le pie chart
function createPieChart(data) {
    const svg = d3.select('#pieChart');

    // Création d'un groupe pour le graphique
    const pieGroup = svg.append('g')
        .attr('transform', 'translate(250,250)'); // Déplacer le groupe au centre du SVG

    // Création d'une échelle de couleur
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Création de la fonction pie pour générer les angles
    const pie = d3.pie()
        .value(d => d.value);

    // Création des arcs
    const arcs = pie(data);

    // Création de l'arc generator
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(200);

    // Création des sections du pie chart
    pieGroup.selectAll('path')
        .data(arcs)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => colorScale(i))
        .attr('stroke', 'white')
        .style('stroke-width', '2px');

    // Légende
    const legend = pieGroup.selectAll('.legend')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(230, ${i * 20})`); // Ajuster la position horizontale ici

    legend.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', (d, i) => colorScale(i));

    legend.append('text')
        .attr('x', 20)
        .attr('y', 10)
        .text(d => d.label);
}

// Fonction pour créer le deuxième pie chart
function createSecondPieChart(data) {
    const svg = d3.select('#pieChart');

    // Création d'un deuxième groupe pour le deuxième pie chart, décalé vers la droite
    const pieGroup2 = svg.append('g')
        .attr('transform', 'translate(950,250)'); // Déplacer le groupe à droite

    // Création d'une échelle de couleur pour le deuxième pie chart
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Création des arcs pour le deuxième pie chart
    const arcs = d3.pie()
        .value(d => d.value)(data);

    // Création de l'arc generator pour le deuxième pie chart
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(200);

    // Création des sections du deuxième pie chart
    pieGroup2.selectAll('path')
        .data(arcs)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => colorScale(i))
        .attr('stroke', 'white')
        .style('stroke-width', '2px');

    // Légende pour le deuxième pie chart
    const legend2 = pieGroup2.selectAll('.legend')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(230, ${i * 20})`); // Ajuster la position horizontale ici

    legend2.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', (d, i) => colorScale(i));

    legend2.append('text')
        .attr('x', 20)
        .attr('y', 10)
        .text(d => d.label);
    
}
