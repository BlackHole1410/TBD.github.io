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

  // Stockage des données originales pour une réinitialisation ultérieure
  const originalData = data.slice();

  // Fonction de mise à jour des filtres
  function updateFilters() {
    const searchText = searchInput.property("value").trim().toLowerCase();
    const selectedColumn = searchColumn.property("value");
    
    const secondSearchText = secondSearchInput.property("value").trim().toLowerCase();
    const selectedSecondColumn = secondSearchColumn.property("value");

    const filteredData = originalData.filter(d => {
      const rowData = String(d[selectedColumn]).toLowerCase();
      const secondRowData = String(d[selectedSecondColumn]).toLowerCase();
      return rowData.includes(searchText) && secondRowData.includes(secondSearchText);
    });

    // Afficher seulement les 1000 premières correspondances
    const limitedData = filteredData.slice(0, 1000);

    // Mettre à jour le tableau avec les données filtrées et limitées
    updateTable(limitedData);
  }

  // Fonction pour mettre à jour le tableau avec les données filtrées
  function updateTable(data) {
    const table = d3.select("#tableau");
  
    const thead = table.selectAll("thead").data([null]);
    thead.enter().append("thead").append("tr");
    const headers = thead.selectAll("th").data(Object.keys(data[0]).filter(key => key !== "name")); // Exclure la colonne "name"
    headers.enter().append("th").merge(headers)
      .text(d => d);
  
    const tbody = table.selectAll("tbody").data([null]);
    tbody.enter().append("tbody");
  
    // Sélectionner toutes les lignes de tableau dans le corps du tableau
    const rows = tbody.selectAll("tr").data(data, d => d.id); // Assurez-vous d'avoir une clé unique pour chaque ligne
    const rowsEnter = rows.enter().append("tr");
  
    // Pour chaque ligne, sélectionner toutes les cellules et les lier aux valeurs de données correspondantes
    const cells = rowsEnter.selectAll("td")
      .data(d => Object.keys(d).filter(key => key !== "name").map(key => d[key]));
  
    // Ajouter une nouvelle cellule pour chaque valeur de données non liée à la colonne "name"
    cells.enter().append("td")
      .merge(cells)
      .text(d => d);
  
    // Supprimer les lignes qui ne correspondent plus aux données
    rows.exit().remove();
  }

  // Ajout des noms des variables dans l'en-tête du tableau
  const table = d3.select("#tableau");
  const thead = table.append("thead").append("tr");
  thead.selectAll("th")
    .data(Object.keys(data[0]))
    .enter()
    .append("th")
    .text(d => d);

  // Ajout des données (limitées aux 100 premières lignes) dans le corps du tableau
  const tbody = table.append("tbody");
  updateTable(data.slice(0, 100));

  // Barre de recherche principale
  const searchBar = d3.select("body").insert("div", "#tableau");

  searchBar.append("input")
    .attr("type", "text")
    .attr("id", "searchInput")
    .attr("placeholder", "Recherche principale...");

  searchBar.append("select")
    .attr("id", "searchColumn")
    .classed("dropdown-list", true)
    .selectAll("option")
    .data(Object.keys(data[0]))
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  const searchInput = searchBar.select("#searchInput");
  const searchColumn = searchBar.select("#searchColumn");

  searchInput.on("input", updateFilters);
  searchColumn.on("change", updateFilters);

  // Barre de recherche secondaire
  const secondSearchBar = d3.select("body").insert("div", "#tableau");

  secondSearchBar.append("input")
    .attr("type", "text")
    .attr("id", "secondSearchInput")
    .attr("placeholder", "Recherche secondaire...");

  secondSearchBar.append("select")
    .attr("id", "secondSearchColumn")
    .classed("dropdown-list", true)
    .selectAll("option")
    .data(Object.keys(data[0]))
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  const secondSearchInput = secondSearchBar.select("#secondSearchInput");
  const secondSearchColumn = secondSearchBar.select("#secondSearchColumn");

  secondSearchInput.on("input", updateFilters);
  secondSearchColumn.on("change", updateFilters);
});
