/**
 * Created by Vincent FILLON on 01/10/2015.
 */

/* --------------------------------------------------=[ PROTOTYPES ]=------------------------------------------------ */

// ----------=[ CHOSEN PLUGIN - Mobile touch support ]=----------
var ChosenTouchController = function(chosenContainer) {
  this.chosenContainer = chosenContainer;
  
  this.touchStartY = null;
  this.touchMoveY = null;
  this.oldTouchMoveY = null;
  this.moved = false;
  this.direction = null;
  this.triggered = false;
  this.scrolled = false;
};

ChosenTouchController.prototype.init = function() {
  var _this = this;
  $(this.chosenContainer)
    .on('touchstart', null, _this, _this.onTouchStart)
    .on('touchmove', null, _this, _this.onTouchMove)
    .on('touchend', null, _this, _this.onTouchEnd);
};

ChosenTouchController.prototype.getPointerEvent = function(event) {
  return event.originalEvent.targetTouches ? event.originalEvent.targetTouches[0] : event;
};

ChosenTouchController.prototype.onTouchStart = function(event) {
  event.preventDefault();
  var _this         = event.data,
      pointer       = _this.getPointerEvent(event),
      currentTarget = $(event.target);
  _this.touchStartY = pointer.pageY;
  _this.touchMoveY = _this.touchStartY;
  setTimeout(function() {
    if(!_this.triggered && event.target !== $(_this.chosenContainer).find('input')[0] && event.target === $(_this.chosenContainer).find('span')[0]) {
      currentTarget.trigger('mouseup');
      _this.triggered = true;
    }
  }, 300);
  
  if(event.target === $(_this.chosenContainer).find('input')[0] || event.target === $(_this.chosenContainer).find('span')[0]) {
    $(_this.chosenContainer).trigger('mousedown');
  }
};

ChosenTouchController.prototype.onTouchMove = function(event) {
  event.preventDefault();
  var _this   = event.data,
      pointer = _this.getPointerEvent(event);
  _this.touchMoveY = pointer.pageY;
  _this.moved = true;
  
  if(event.target !== $(_this.chosenContainer).find('input')[0] && event.target !== $(_this.chosenContainer).find('span')[0]) {
    _this.triggered = true;
    var currentDirection = null,
        scroll           = 0;
    if(_this.oldTouchMoveY !== null) {
      if(_this.direction === 'desc' && _this.oldTouchMoveY > _this.touchMoveY) {
        currentDirection = 'asc';
        scroll = _this.oldTouchMoveY - _this.touchMoveY;
      } else if(_this.direction === 'asc' && _this.oldTouchMoveY < _this.touchMoveY) {
        currentDirection = 'desc';
        scroll = _this.touchMoveY - _this.oldTouchMoveY;
      } else currentDirection = _this.direction;
    }
    if(_this.touchStartY > _this.touchMoveY || (_this.direction === 'desc' && currentDirection !== _this.direction)) {
      $(_this.chosenContainer).find('ul.chosen-results')[0].scrollTop += _this.direction === 'desc' && currentDirection !== _this.direction ? scroll : _this.touchStartY - _this.touchMoveY;
      _this.scrolled = true;
    } else if(_this.touchStartY < _this.touchMoveY || (_this.direction === 'asc' && currentDirection !== _this.direction)) {
      $(_this.chosenContainer).find('ul.chosen-results')[0].scrollTop -= _this.direction === 'asc' && currentDirection !== _this.direction ? scroll : _this.touchMoveY - _this.touchStartY;
      _this.scrolled = true;
    }
    _this.direction = currentDirection;
  }
  
  _this.oldTouchMoveY = _this.touchMoveY;
};

ChosenTouchController.prototype.onTouchEnd = function(event) {
  event.preventDefault();
  var _this = event.data;
  
  if(event.target === $(_this.chosenContainer).find('input')[0] || event.target === $(_this.chosenContainer).find('span')[0]) {
    $(_this.chosenContainer).trigger('mouseup');
  } else if(!_this.scrolled && (((_this.touchStartY - 5 <= _this.touchMoveY <= _this.touchStartY + 5) && _this.moved) || !_this.moved)) {
    $(event.target).trigger('mouseup');
  }
  
  _this.touchStartY = null;
  _this.touchMoveY = null;
  _this.oldTouchMoveY = null;
  _this.moved = false;
  _this.direction = null;
  _this.triggered = false;
  _this.scrolled = false;
};

// ----------=[ DATE ]=----------
Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
};

Date.prototype.toStringPerso = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
  var dd = this.getDate().toString();
  return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]); // padding
};

/* --------------------------------------------------=[ FONCTIONS ]=------------------------------------------------- */

/**
 * Fonction permettant de switcher entre le formulaire de recherche Ventre/Location et celui de Vacances
 * Module(s) : recherche_rapide | recherche_avancee
 *
 * @param transac
 */
var changeFormRecherche     = function(transac) {
  var form_recherche          = $('#form_recherche'),
      form_recherche_vacances = $('#form_recherche_vacances'),
      transac_select,
      container;
  
  if(transac === 'vacances') {
    form_recherche.addClass('hidden');
    form_recherche_vacances.removeClass('hidden');
    transac_select = form_recherche_vacances.find('#form_vacances_transac');
    container = form_recherche_vacances;
  } else {
    form_recherche_vacances.addClass('hidden');
    form_recherche.removeClass('hidden');
    transac_select = form_recherche.find('#transac');
    container = form_recherche;
  }
  
  transac_select.val(transac);
  transac_select.trigger("chosen:updated");
  
  return container;
},

    /**
     * Fonction de tri des biens
     * Module(s) : resultats
     *
     * @param tri
     * @param ordre
     * @returns {Function}
     */
    propertiesSort          = function(tri, ordre) {
      var sortOrder = 1;
      if(ordre === "desc") sortOrder = -1;
  
      return function(a, b) {
        var item_a = a[tri], item_b = b[tri];
        if(tri === 'surface' || tri === 'prix') {
          item_a = isNaN(parseInt(String(item_a).replace(/[^\d.]/g, ''))) ?
            0 : parseInt(String(item_a).replace(/[^\d.]/g, ''));
      
          item_b = isNaN(parseInt(String(item_b).replace(/[^\d.]/g, ''))) ?
            0 : parseInt(String(item_b).replace(/[^\d.]/g, ''));
        }
        var result = (item_a < item_b) ? -1 : (item_a > item_b) ? 1 : 0;
        return result * sortOrder;
      }
    },

    /**
     * Fonction permettant l'affichage des biens selon le template choisit (grid ou list)
     * Module(s) : resultats
     *
     * @param properties
     * @param container
     * @param template
     * @param nb_resultats
     */
    displayProperties       = function(properties, container, template, nb_resultats) {
      container.html('');
  
      var nb_prop = properties.length,
          images  = [],
          count   = 1;
  
      $.each(properties, function(index, property) {

        var item,
            imgID = 'img-property-' + property.id.replace(/\*/g, "");

        if(template === 'grid') {
          item = '<div class="col-xs-12 col-sm-6 col-md-4 animation">' +
            '    <div class="pgl-property">' +
            '        <div data-markerid="' + property.id + '" class="map_grid_bien_link property-thumb-info">' +
            '            <div class="property-thumb-info-image img-container">' +
            '                <a id="' + imgID + '" href="' + property.lien + '">' +
            '                    <img class="loader" src="images/loading.gif" alt="loader" style="width: 32px; height: 32px; position: absolute; left: calc(50% - 16px); top: calc(50% - 16px);"/>' +
            '                </a>' +
            '                <span class="property-thumb-info-label">' +
            '                    <span class="label price">' + property.prix + '</span>' +
            '                </span>' +
            '            </div>' +
            '            <div class="property-thumb-info-content">' +
            '                <h3><strong><a href="' + property.lien + '">' + property.titre + '</a></strong></h3>' +
            '                <p>' + property.description + '</p>' +
            '            </div>' +
            '            <div class="amenities clearfix">' +
            '                <ul class="pull-left">' +
            '                    <li>' + property.surface + '</li>' +
            '                </ul>' +
            '                <ul class="pull-right">' +
            '                    <li>' + property.ville + '</li>' +
            '                </ul>' +
            '            </div>' +
            '        </div>' +
            '    </div>' +
            '</div>';
        } else if(template === 'tblr_grid') {
          item = '<div class="col-xs-12 col-sm-6 col-md-4 animation grid-property-container">' +
            '    <div class="pgl-property">' +
            '        <div data-markerid="' + property.id + '" class="map_grid_bien_link property-thumb-info">' +
            '            <div class="property-thumb-info-image img-container">' +
            '                <a id="' + imgID + '" href="' + property.lien + '">' +
            '                    <img class="img-responsive" src="' + property.image + '" alt="' + property.titre + '"/>' +
            '                </a>' +
            '                <span class="property-thumb-info-label">' +
            '                    <span class="label price">' + property.prix + '</span>' +
            '                </span>' +
            '            </div>' +
            '            <div class="property-thumb-info-content">' +
            '                <h3><strong><a href="' + property.lien + '">' + property.titre + '</a></strong></h3>' +
            '                <p>' + property.description + '</p>' +
            '            </div>' +
            '            <div class="amenities clearfix">' +
            '                <ul class="pull-left">' +
            '                    <li>' + property.surface + '</li>' +
            '                </ul>' +
            '                <ul class="pull-right">' +
            '                    <li>' + property.ville + '</li>' +
            '                </ul>' +
            '            </div>' +
            '        </div>' +
            '    </div>' +
            '</div>';
        } else {
          item = '<div class="pgl-property animation">' +
            '    <div class="row">' +
            '        <div class="col-sm-6 col-md-4">' +
            '            <div class="property-thumb-info-image img-container">' +
            '                <a id="' + imgID + '" href="' + property.lien + '">' +
            '                    <img class="loader" src="images/loading.gif" alt="loader" style="width: 32px; height: 32px; position: absolute; left: calc(50% - 16px); top: calc(50% - 16px);"/>' +
            '                </a>' +
            '                <span class="property-thumb-info-label">' +
            '                    <span class="label price">' + property.prix + '</span>' +
            '                </span>' +
            '            </div>' +
            '        </div>' +
            '        <div class="col-sm-6 col-md-8">' +
            '            <div class="property-thumb-info">' +
            '                <div class="property-thumb-info-content">' +
            '                    <h3 style="font-weight: bold; height: 45px;"><a href="' + property.lien + '">' + property.titre + '</a></h3>' +
            '                    <p>' + property.description + '</p>' +
            '                </div>' +
            '                <div class="amenities clearfix">' +
            '                    <ul class="pull-left">' +
            '                        <li>' + property.surface + '</li>' +
            '                    </ul>' +
            '                    <ul class="pull-right">' +
            '                        <li>' + property.ville + '</li>' +
            '                    </ul>' +
            '                </div>' +
            '            </div>' +
            '        </div>' +
            '    </div>' +
            '</div>';
        }
    
        container.append(item);

        if(template !== 'tblr_grid') {
          createImg(property.image, imgID, property.title);

          images.push({
            src: property.image,
            id:  imgID
          });
        }
    
        if(count === nb_prop) {
          if(template === 'tblr_grid') {
            if(container.hasClass('grid')) container.masonry('destroy');
            container.addClass('grid');
            container.imagesLoaded(function() {
              container.masonry({
                itemSelector: '.grid-property-container'
              });
            })
          } else {
            if(container.hasClass('grid')) {
              container
                .masonry('destroy')
                .removeClass('grid');
            }
          }

          container.paginate({
            itemsPerPage: nb_resultats,
            pageChanged:  function() {
              if(template !== 'tblr_grid') {
                $.each(images, function(key, value) {
                  createImg(value.src, value.id, value.title);
                });
              }
            }
          });
          //setImageDimensions(container);
          console.log('Affichage des résultats : OK');
        } else count++;
      });
    },

    /**
     * Fonction pour rappeler l'URL courante avec de nouveaux paramètres ou en changeant les paramètres actuels
     *
     * @param params
     */
    changeUrlParameters     = function(params) {
      var href = window.location.href,
          regex,
          regex_param;
  
      $.each(params, function(id, obj) {
        regex = new RegExp("[&\\?]" + obj.nom + "=");
    
        if(regex.test(href)) {
          regex_param = new RegExp("([&\\?])" + obj.nom + "=([^&]+)");
          if(regex_param.test(href)) href = href.replace(regex_param, '$1' + obj.nom + '=' + obj.val);
          else href = href.replace(regex, "$1" + obj.nom + "=" + obj.val);
        } else {
          if(href.indexOf("?") > -1) href = href + "&" + obj.nom + "=" + obj.val;
          else href = href + "?" + obj.nom + "=" + obj.val;
        }
      });
  
      window.location.href = href;
    },

    /**
     * Fonction pour tester l'accès à une URL et executer la callback
     *
     * @param url
     * @param callback
     */
    urlExists               = function(url, callback) {
      console.log("Test de l'url : " + url);
      $.ajax({
        type:    'HEAD',
        url:     url,
        success: function() {
          console.log("URL ok.");
          testAlreadyDone = true;
          callback(true);
        },
        error:   function() {
          callback(false);
        }
      });
    },

    /**
     * Fonction permettant de définir la height de la video
     * Module(s) : carousel
     */
    setVideoHeight          = function() {
      var container = $('.video-container');
      if(!container.parents('.main-slide').hasClass('no-resize')) {
        var video            = container.find('.video-playing'),
            scale            = 2.714285, // Echelle pour un format 1900 / 700 pixels
            container_height = Math.ceil(container.width() / scale),
            top              = "-" + ( Math.ceil(( video.height() - container_height ) / 2) ) + "px";
    
        container.css({
          height: container_height + "px"
        });
    
        video.css({
          marginTop: top
        });
      }
    },

    /**
     * Fonction permettant de calculer les dimensions d'un element pour qu'il ne dépasse pas les valeurs maximums
     * mais conserve ses proportions d'origine
     *
     * @param srcWidth
     * @param srcHeight
     * @param maxWidth
     * @param maxHeight
     * @returns {{width: number, height: number}}
     */
    calculateAspectRatioFit = function(srcWidth, srcHeight, maxWidth, maxHeight) {
      var w_ratio = (maxWidth / srcWidth) > 0 ? maxWidth / srcWidth : (maxWidth / srcWidth) * -1,
          h_ratio = (maxHeight / srcHeight) > 0 ? maxHeight / srcHeight : (maxHeight / srcHeight) * -1,
          ratio   = Math.min(w_ratio, h_ratio);
  
      return {
        'width':  srcWidth * ratio,
        'height': srcHeight * ratio
      };
    },

    /**
     * Fonction permettant de définir dynamiquement les dimensions d'une image
     *
     * @param main
     * @param {boolean} [firstCall]
     */
    setImageDimensions      = function(main, firstCall) {
      var images = main.find('img');
      firstCall = (typeof firstCall === 'undefined') ? false : firstCall;

      if(firstCall) {
        main.imagesLoaded(function() {
          $.each(images, function(id, image) {
            var image_width  = image.naturalWidth,
                image_height = image.naturalHeight,
                container    = $(image).parents('.img-container'),
                max_width    = container.width(),
                max_height   = container.height(),
                dimensions   = calculateAspectRatioFit(image_width, image_height, max_width, max_height);

            $(image).css({'marginTop': '0'});

            $(image).width(dimensions.width);
            $(image).height(dimensions.height);

            if(dimensions.height < max_height) {
              var marginTop = (max_height - dimensions.height) / 2;
              $(image).css({'marginTop': marginTop + 'px'});
            }
          });
        });
      } else {
        $.each(images, function(id, image) {
          var image_width  = image.naturalWidth,
              image_height = image.naturalHeight,
              container    = $(image).parents('.img-container'),
              max_width    = container.width(),
              max_height   = container.height(),
              dimensions   = calculateAspectRatioFit(image_width, image_height, max_width, max_height);

          $(image).css({'marginTop': '0'});

          $(image).width(dimensions.width);
          $(image).height(dimensions.height);

          if(dimensions.height < max_height) {
            var marginTop = (max_height - dimensions.height) / 2;
            $(image).css({'marginTop': marginTop + 'px'});
          }
        });
      }
    },

    /**
     * Fonction d'instanciation d'un objet Image aux dimensions appropriées à son conteneur
     *
     * @param src
     * @param id
     */
    createImg               = function(src, id, alt) {
      var image = new Image();
      //alt = alt.replace('&eacute;','é').replace('&euro;','€').replace('&egrave;','è').replace('&agrave;','à').replace('&sup2;','²') || '';
      $(image).attr('alt',alt);
      image.onload = function() {
        $('#' + id).html(image);
    
        var image_width  = image.naturalWidth,
            image_height = image.naturalHeight,
            container    = $(image).parents('.img-container'),
            max_width    = container.width(),
            max_height   = container.height(),
            dimensions   = calculateAspectRatioFit(image_width, image_height, max_width, max_height);
    
        $(image).width(dimensions.width);
        $(image).height(dimensions.height);
        $(image).addClass('img-responsive center-block');
    
        if(dimensions.height < max_height) {
          var marginTop = (max_height - dimensions.height) / 2;
          $(image).css({
            'marginTop': marginTop + 'px'
          });
        }
      };
      image.src = src;
    },

    /**
     * Permet de centrer une image dans son conteneur
     *
     * @param id
     */
    centerImg               = function(id) {
      var img        = $('#' + id),
          container  = img.parents('.img-container'),
          marginLeft = (container[0].offsetWidth - img.width()) / 2,
          marginTop  = (container[0].offsetHeight - img.height()) / 2;

      img.css({
        'margin-left': marginLeft,
        'margin-top':  marginTop
      });
    },

    /**
     * Fonction d'initialisation de toute les Google Maps courantes
     */
    initMaps                = function() {
      $.each(__maps, function(index, map) {
        var myLatLng      = {
              lat: map.latitude,
              lng: map.longitude
            },
    
            // Create a map object and specify the DOM element for display.
            current_map   = new google.maps.Map(document.getElementById(map.id), {
              center: myLatLng,
              zoom:   15
            }),
    
            contentString = map.infowindow,
    
            infowindow    = new google.maps.InfoWindow({
              content: contentString
            }),
    
            // Create a marker and set its position.
            marker        = new google.maps.Marker({
              map:      current_map,
              position: myLatLng
            });
    
        marker.addListener('click', function() {
          infowindow.open(current_map, marker);
        });
      });
    },

    getDatesBetween         = function(startDate, stopDate) {
      var dateArray = [];
      var currentDate = startDate;
      while(currentDate < stopDate) {
        dateArray.push(new Date(currentDate));
        currentDate = currentDate.addDays(1);
      }
      return dateArray;
    },

    /**
     * Fonction permettant l'affichage d'un GIF de loading dans un container et d'empêcher le click dans ce container
     *
     * @param container
     * @param id
     * @returns {string|*}
     */
    loading                 = function(container, id) {
      id = (typeof(id) === String && id !== '' && id !== 'undefined') ? id : 'loading';
      var top = Math.round(($(container).outerHeight() / 2) - 15);
      $(container).append(
        '<div id="' + id + '" style="position: absolute; width: 100%; height: 100%; z-index: 1; top: 0; left: 0; background: rgba(211,211,211,0.4);">' +
        '   <img src="images/loading.gif" alt="loader" style="position: absolute; width: 30px; height: 30px; margin: auto; top: ' + top + 'px; left: 0; right: 0;"/>' +
        '</div>'
      );
      return id;
    },

    /**
     * Fonction permettant de supprimer le loading
     *
     * @param id
     */
    stopLoading             = function(id) {
      id = (typeof(id) === String && id !== '' && id !== 'undefined') ? id : 'loading';
      var loader = $('#' + id);
      if(loader.length) loader.remove();
    },

    /**
     * Fonction permettant de mettre la première lettre de chaque mot de str en majuscule
     *
     * @param str
     * @returns {string}
     */
    ucwords                 = function(str) {
      return (str + '').replace(/^([a-z])|\s+([a-z])/g, function($1) {
        return $1.toUpperCase();
      });
    },

    /**
     * Fonction permettant de retourner str en minuscule
     *
     * @param str
     * @returns {string}
     */
    strtolower              = function(str) {
      return (str + '').toLowerCase();
    },

    /**
     * Fonction permettant de faire un appel AJAX en GET sur le fichier php/tools/ajax.php
     *
     * @param params
     * @param callback
     */
    ajaxGET                 = function(params, callback) {
      $.ajax({
        type:       'GET',
        url:        __url,
        data:       params.data,
        dataType:   'json',
        beforeSend: function() {
          if(params.container != null) loading(params.container);
        },
        success:    function(data) {
          stopLoading();
          callback(data);
        }
      });
    },

    /**
     * Fonction permettant de faire un appel AJAX en POST sur le fichier php/tools/ajax.php
     *
     * @param params
     * @param callback
     */
    ajaxPOST                = function(params, callback) {
      $.ajax({
        type:       'POST',
        url:        __url,
        data:       params.data,
        dataType:   'json',
        beforeSend: function() {
          if(params.container != null) loading(params.container);
        },
        success:    function(data) {
          stopLoading();
          callback(data);
        }
      });
    };

/* -----------------------------------------------=[ DOCUMENT.READY ]=----------------------------------------------- */
$(document).ready(function() {
  // Initialisation des tooltip
  var tooltips = $('[data-toggle="tooltip"], [data-custom-tooltip-ics="tooltip"]');
  if(tooltips.length) tooltips.tooltip();
  
  // Initialisation des chosen select (formulaire)
  var chosenSingle = $('.chzn-select');
  if(chosenSingle.length) {
    chosenSingle
    /*.on('chosen:ready', function(evt) {

     })*/
      .chosen({
        allow_single_deselect: true,
        no_results_text:       "Aucun r&eacute;sultat pour :"
      })
      .trigger('chosen:updated');
  }
  
  var chosenMultiple = $('.chosen-select');
  if(chosenMultiple.length) {
    chosenMultiple
      .chosen({
        no_results_text: "Aucun r&eacute;sultat pour :"
      })
      .trigger('chosen:updated');
  }
  
  var chosenContainer = $('.chosen-container');
  if(chosenContainer.length) {
    $.each(chosenContainer, function(index, object) {
      var controller = new ChosenTouchController(object);
      controller.init();
    });
  }

  // Initialisation des select2
  var select2 = $('.select2');
  if(select2.length) {
    select2.select2({
      language:   'fr',
      theme:      'bootstrap',
      allowClear: true
    });
  }
  
  // Initialisation des datepicker (formulaire)
  var formVacances = $('#tab-vacances-form, #form_recherche_vacances'),
      datepickers  = formVacances.find('.datepicker');
  if(datepickers.length) {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    
    formVacances.datepicker({
      language:              'fr',
      format:                'dd/mm/yyyy',
      startDate:             date,
      daysOfWeekDisabled:    [0, 1, 2, 3, 4, 5],
      daysOfWeekHighlighted: [6],
      inputs:                datepickers
    });
  }
  

  // Chargement de la date de fin lors de la selection date de debut
  $('#dateDebut').datepicker().on('changeDate', function(e) {
        /*
        var oldDate = new Date(e.date);
        var oldDateUS = new Date(oldDate.getFullYear()+"-"+("0" + (oldDate.getMonth() + 1)).slice(-2)+"-"+("0" + (oldDate.getDate())).slice(-2));
        var newDate = new Date();
        newDate.setDate(oldDateUS.getDate() + 7);
        $('#dateFin').val( ("0" + (newDate.getDate())).slice(-2)+"/"+("0" + (newDate.getMonth() + 1)).slice(-2)+"/"+newDate.getFullYear());
        */
        $('#dateFin').val('');
  });

  

  // Initialisation des plannings (fiche)
  if(__ficheDatePicker) {
    $('.fiche-datepicker').datepicker({
      language:      'fr',
      format:        'yyyy-mm-dd',
      startDate:     planning[0].dateDebut,
      endDate:       planning[planning.length - 1].dateFin,
      beforeShowDay: function(date) {
        var day  = date.toStringPerso(),
            week = planning.find(function(obj) {
              var days = getDatesBetween(new Date(obj.dateDebut), new Date(obj.dateFin));
              for(var l = 0; l < days.length; l++) {
                if(days[l].toStringPerso() === day) return true;
              }
              return false;
            });
        
        if(week !== undefined) {
          setTimeout(function() {
            $('.planning-tooltip-' + day).tooltip({
              container: 'body'
            });
          }, 500);
          if(week.occupe === '1') {
            return {
              'enabled': false,
              'classes': 'reserve planning-tooltip-' + day,
              'tooltip': 'Tarif : ' + week.prix + ' &euro; / semaine'
            }
          } else return {
            'enabled': false,
            'classes': 'libre planning-tooltip-' + day,
            'tooltip': 'Tarif : ' + week.prix + ' &euro; / semaine'
          }
        }
      }
    });
  }
  
  // Initialisation des Google Maps
  initMaps();
  
  // Initialisation des formulaires de contact
  var form_contact = $('#contact-form');
  if(form_contact.length) {
    var url = location.href.split('/');
    var last = url.length;
    var page_with_params = url[last - 1].split('?');
    var page = page_with_params[0];
    
    $('[name="return_page"]').val(page);
    
    form_contact.validationEngine({promptPosition: "topRight:-145"});
  }

  // Initialisation du formulaire d'envoi de selection
  var form_envoi_selection = $('#envoi_selection_form');
  if(form_envoi_selection.length) {
    var url = location.href.split('/');
    var last = url.length;
    var page_with_params = url[last - 1].split('?');
    var page = page_with_params[0];
    
    $('[name="return_page"]').val(page);
    
    form_envoi_selection.validationEngine({promptPosition: "topRight:-145"});
  }
  
  // Initalisation de l'anti robot Google ReCAPTCHA
  $('#captcha').realperson({regenerate: 'Changer de code'});
  
  // Tri et affichage des biens sur la page de résultats (grid | list)
  var properties_display = $('#properties_list');
  if(properties_display.length) {
    properties.sort(propertiesSort(tri_initial, ordre_initial));
    displayProperties(properties, properties_display, template_resultats, parseInt(nb_resultats_page));
  }
  
  // Tri et affichage des biens sur la page de résultats (map)
  var properties_grid = $('#properties_map_grid');
  if(properties_grid.length) {
    properties.sort(propertiesSort(tri_initial, ordre_initial));
    if($(this).is(":visible")) map_grid_properties(properties, properties_grid);
    else map_grid_properties(properties, $('#xs-properties_map_grid'));
  }
  
  // Définition des dimensions de la video du carousel
  if($('.video-container').length) setVideoHeight();
  
  // Définition des dimensions des images du slider et des miniatures pour les fiches de bien
  var slides = $('#slider, #carousel');
  if(slides.length) setImageDimensions(slides, true);
  
  // Définition des dimensions pour les images des coups de coeurs
  var cc_block = $('#coup-coeur-list');
  if(cc_block.length) setImageDimensions(cc_block, true);
  
  // Initialisation des Switch On/Off Bootstrap
  var switchs = $('.bs-switch-cb');
  if(switchs.length) {
    $.fn.bootstrapSwitch.defaults.onText = 'Oui';
    $.fn.bootstrapSwitch.defaults.offText = 'Non';
    switchs.bootstrapSwitch();
  }
});

/* -------------------------------------------------=[ WINDOW.LOAD ]=------------------------------------------------ */
$(window).load(function() {
  //if($('#dateDebut').length) initDatePicker();
});

/* ------------------------------------------------=[ WINDOW.RESIZE ]=----------------------------------------------- */
$(window).resize(function() {
  var slides = $('#slider, #carousel');
  if(slides.length) setImageDimensions(slides);
  
  if($('.video-container').length) setVideoHeight();
});

/* ------------------------------------------------=[ EVENTS HANDLER ]=---------------------------------------------- */

/* ----------=[ MODULE(S) : panier ]=---------- */

// Click sur le bouton Ajouter au panier
$(document).on('click', '.ajouter_panier', function() {
  var tab_id = $(this).attr("id").split("_");
  var transac = tab_id[0];
  var id_bien = tab_id[1];

  $.ajax({
    type:    'POST',
    url:     __url,
    data:    {
      action:  'post_ajouter_panier',
      transac: transac,
      id_bien: id_bien
    },
    success: function(data) {
      if(data.status == "success") {
        //console.log(data.message);
        //$('#alerte_mail_modal').modal('toggle');

        var alert_box = $('#form_alert_message');
        alert_box.addClass('alert-' + data.status);

        $('#form_alert_content').html(data.message);
        //alert_box.show();
        
        alert_box.show().delay(5000).queue(function(next) {
          $(this).hide();
          next();
        });
        
      }
    }
  });
});

// Click sur le bouton Supprimer ce bien du panier
$(document).on('click', '.supprimer_panier', function() {
  var id_bien = $(this).attr("id");
  //console.log("test");
  $.ajax({
    type:    'POST',
    url:     __url,
    data:    {
      action:  'post_supprimer_panier',
      id_bien: id_bien
    },
    success: function(data) {
      if(data.status == "success") {
        $('#alerte_mail_modal').modal('toggle');

        var alert_box = $('#form_alert_message');
        alert_box.addClass('alert-' + data.status);

        $('#form_alert_content').html(data.message);
        //alert_box.show();
        
        alert_box.show().delay(500).queue(function(next) {
          location.reload();
          next();
        });
        
      }
    }
  });
});

/* ----------=[ MODULE(S) : carousel ]=---------- */

// Click sur le bouton mute de la video du carousel
$(document).on('click', '#mute', function() {
  var video = $('video');
  video.prop('muted', !video.prop('muted'));
  $(this).find('span')
    .toggleClass('muted')
    .toggleClass('unmuted');
});

/* ----------=[ MODULE(S) : recherche_rapide_onglet ]=---------- */

// Click sur le bouton plus / moins de critères
$(document).on('click', '.show-criteres-sup', function() {
  var transac = $(this).data('transac');
  var row = $('#tab-' + transac + '-criteres-sup');
  if(row.is(':visible')) $(this).html('Plus de critères');
  else $(this).html('Moins de critères');
  row.slideToggle(500);
});

// Choix du type de bien
$(document).on('change', '#tab-location-type, #tab-vente-type', function() {
  var transac         = $(this).parents('form').find('[name="transac"]').val(),
      type            = $(this).val(),
      partenaires     = $('#tab-' + transac + '-partenaires').val(),
      ville_select    = $('#tab-' + transac + '-ville'),
      alentour_select = $('#tab-' + transac + '-alentour'),
      client          = __dossier_client !== null ? __dossier_client : '';
  
  ajaxGET({
    'container': '#tab-' + transac + '-form',
    'data':      {
      'dossier_client': client,
      'action':         'get_ville_bien',
      'transac':        transac,
      'type':           type,
      'partenaires':    partenaires
    }
  }, function(data) {
    ville_select.children().remove();
    
    $.each(data.options, function(idx, obj) {
      ville_select.append('<option value="' + idx + '">' + ucwords(strtolower(obj)) + '</option>');
      ville_select.trigger("chosen:updated");
    });
    alentour_select.val("");
    alentour_select.trigger("chosen:updated");
  });
});

// Choix de la ville
$(document).on('change', '#tab-location-ville, #tab-vente-ville, #tab-vacances-ville', function() {
  var transac = $(this).parents('form').find('[name="transac"]').val();
  if(Array.isArray($(this).val()) || $(this).val() !== '') {
    var alentour = $('#tab-' + transac + '-alentour');
    alentour
      .prop('disabled', false)
      .trigger('chosen:updated');
  }
});

// Permettre de déselectionner un radio button
$(document).on('click', '#tab-vacances-criteres-sup [name="type"]', function() {
  var otherRadio = $('#tab-vacances-criteres-sup').find('[name="type"]').not($(this));
  if($(this).attr('previousValue') === 'true') {
    $(this)
      .prop('checked', false)
      .attr('previousValue', false);
  } else {
    $(this)
      .prop('checked', true)
      .attr('previousValue', true);
    
    otherRadio
      .prop('checked', false)
      .attr('previousValue', false);
  }
});

/* ----------=[ MODULE(S) : recherche_rapide | recherche_avancee ]=---------- */

// Choix d'inclure ou non les résultats des agences partenaires
$(document).on('change', '#include_partenaires', function() {
  var container      = $(this).parents('form'),
      partenaires    = $(this).is(":checked"),
      transac_select = $('#transac'),
      client         = __dossier_client !== null ? __dossier_client : '';
  
  ajaxGET({
    'container': container,
    'data':      {
      'dossier_client': client,
      'action':         'get_transac',
      'partenaires':    partenaires
    }
  }, function(data) {
    //console.log(data);
    transac_select.children().remove();
    transac_select.append('<option value=""></option>');
    
    $.each(data, function(idx, obj) {
      transac_select.append('<option value="' + idx + '">' + obj + '</option>');
      transac_select.trigger("chosen:updated");
    });
  });
});

// Choix du type de transaction
$(document).on('change', '#transac, #form_vacances_transac', function() {
  var transac         = ($(this).val() != "undefined" && $(this).val() != null) ? $(this).val() : false,
      agence          = $('#agence').val(),
      container       = changeFormRecherche(transac),
      partenaires     = $('#include_partenaires').is(":checked"),
      alentour_select = $('#alentour'),
      type_select     = $('#type'),
      client          = __dossier_client !== null ? __dossier_client : '',
  
      submit_button,
      ville_select;
  
  alentour_select.val("");
  alentour_select.trigger("chosen:updated");
  
  if(transac != 'vacances') {
    ville_select = $('#ville');
    submit_button = $('#submit_recherche');
    
    if(transac != "") submit_button.prop('disabled', false);
    else submit_button.prop('disabled', true);
    
    ajaxGET({
      'data': {
        'dossier_client': client,
        'action':         'get_type_bien',
        'transac':        transac,
        'partenaires':    partenaires,
        'agence':         agence
      }
    }, function(data) {
      //console.log(data);
      type_select.children().remove();
      
      $.each(data, function(idx, obj) {
        type_select.append('<option value="' + idx + '">' + obj + '</option>');
        type_select.trigger("chosen:updated");
      });
    });
  } else {
    ville_select = $('#form_vacances_ville');
    submit_button = $('#form_vacances_submit_recherche');
    
    submit_button.prop('disabled', false);
  }
  
  ajaxGET({
    'container': container,
    'data':      {
      'dossier_client': client,
      'action':         'get_ville_bien',
      'transac':        transac,
      'partenaires':    partenaires,
      'agence':         agence
    }
  }, function(data) {
    //console.log(data);
    ville_select.children().remove();
    
    if(transac === 'vacances') ville_select.append('<option value=""></option>');
    
    $.each(data.options, function(idx, obj) {
      ville_select.append('<option value="' + idx + '">' + ucwords(strtolower(obj)) + '</option>');
      ville_select.trigger("chosen:updated");
    });
    
    var input_cp = $('#cp'),
        cp_val   = input_cp.val(),
        reset_cp = true;
    
    for(var it = 0; it < data.cp.length; it++) {
      if(cp_val === data.cp[it]) reset_cp = false;
      if(it === (data.cp.length - 1) && reset_cp) input_cp.val("");
    }
  });
});

// Choix du type de bien
$(document).on('change', '#type', function() {
  var container       = $(this).parents('form'),
      transac         = $('#transac').val(),
      type            = $(this).val(),
      partenaires     = $('#include_partenaires').is(":checked"),
      ville_select    = $('#ville'),
      client          = __dossier_client !== null ? __dossier_client : '',
  
      alentour_select = $('#alentour');
  
  //console.log(container);
  //console.log(transac);
  //console.log(type);
  //console.log(ville_select);
  alentour_select.val("");
  alentour_select.trigger("chosen:updated");
  
  ajaxGET({
    'container': container,
    'data':      {
      'dossier_client': client,
      'action':         'get_ville_bien',
      'transac':        transac,
      'type':           type,
      'partenaires':    partenaires
    }
  }, function(data) {
    //console.log(data);
    ville_select.children().remove();
    
    if(transac === 'vacances') ville_select.append('<option value=""></option>');
    
    $.each(data.options, function(idx, obj) {
      ville_select.append('<option value="' + idx + '">' + ucwords(strtolower(obj)) + '</option>');
      ville_select.trigger("chosen:updated");
    });
    
    var input_cp = $('#cp'),
        cp_val   = input_cp.val(),
        reset_cp = true;
    
    for(var it = 0; it < data.cp.length; it++) {
      if(cp_val === data.cp[it]) reset_cp = false;
      if(it === (data.cp.length - 1) && reset_cp) input_cp.val("");
    }
  });
});

// Choix de l'agence

 $(document).on('change', '#agence', function() {
 var container       = $(this).parents('form'),
 transac         = $('#transac').val(),
 type            = $('#type').val(),
 agence          = $(this).val(),
 partenaires     = $('#include_partenaires').is(":checked"),
 ville_select    = $('#ville'),
 type_select     = $('#type'),
 client          = __dossier_client !== null ? __dossier_client : '',

 alentour_select = $('#alentour');

 //console.log(transac);
 //console.log(type);
 //console.log(agence);



 alentour_select.val("");
 alentour_select.trigger("chosen:updated");


 ajaxGET({
 'container': container,
 'data':      {
 'dossier_client': client,
 'action':         'get_infos_biens',
 'transac':        transac,
 'type':           type,
 'agence':         agence,
 'partenaires':    partenaires
 }
 }, function(data) {
    console.log(data);
    ville_select.children().remove();
    
    if(transac === 'vacances') ville_select.append('<option value=""></option>');
    
    $.each(data.options_ville, function(idx, obj) {
      ville_select.append('<option value="' + idx + '">' + ucwords(strtolower(obj)) + '</option>');
      ville_select.trigger("chosen:updated");
    });
    
    var input_cp = $('#cp'),
        cp_val   = input_cp.val(),
        reset_cp = true;
    
    for(var it = 0; it < data.cp.length; it++) {
      if(cp_val === data.cp[it]) reset_cp = false;
      if(it === (data.cp.length - 1) && reset_cp) input_cp.val("");
    }
 });


  ajaxGET({
    'data': {
      'dossier_client': client,
      'action':         'get_type_bien',
      'transac':        transac,
      'partenaires':    partenaires,
      'agence':         agence
    }
  }, function(data) {
    //console.log(data);
    type_select.children().remove();
    
    $.each(data, function(idx, obj) {
      type_select.append('<option value="' + idx + '">' + obj + '</option>');
      type_select.trigger("chosen:updated");
    });
  });
 });
 
// Choix de la ville ou du code postal
$(document).on('change', '#cp, #ville', function() {
  var alentour_select = $('#alentour');
  
  if($(this).val() != "") alentour_select.prop('disabled', false);
  else {
    alentour_select.val("");
    alentour_select.prop('disabled', true);
  }
  
  alentour_select.trigger("chosen:updated");
});

// Click sur le bouton plus de filtres
$(document).on('click', '#btn-plus-filtre', function() {
  var filtres = $('#box-filtres-recherche');
  
  if(filtres.is(':visible')) $(this).text("Plus de filtres");
  else $(this).text("Moins de filtres");
  
  filtres.slideToggle('slow');
});

/* ----------=[ MODULE(S) : alerte_mail ]=---------- */

// Submit du formulaire
$('#form_alert').submit(function(event) {
  event.preventDefault();
  var mail        = $('#alert_mail').val(),
      tel         = $('#alert_tel').val(),
      transac     = $('#alert_transac').val(),
      type        = $('#alert_type').val(),
      nb_pieces   = $('#alert_nb_pieces').val(),
      budget_mini = $('#alert_budget_mini').val(),
      budget_maxi = $('#alert_budget_maxi').val(),
      client      = __dossier_client !== null ? __dossier_client : '';
  
  //console.log(nb_pieces);
  ajaxPOST({
    'data': {
      'dossier_client': client,
      'action':         'post_form_alert',
      'mail':           mail,
      'tel':            tel,
      'transac':        transac,
      'type':           type,
      'nb_pieces':      nb_pieces,
      'budget_mini':    budget_mini,
      'budget_maxi':    budget_maxi
    }
  }, function(data) {
    //console.log(data);
    $('#alerte_mail_modal').modal('toggle');
    
    var alert_box = $('#form_alert_message');
    alert_box.addClass('alert-' + data.status);
    
    $('#form_alert_content').html(data.message);
    alert_box.show();
  });
});

/* ----------=[ MODULE(S) : estimation ]=---------- */

// Submit du formulaire
$('#estimation-form').submit(function(event) {
  event.preventDefault();
  var nom         = $('#estimation-nom').val(),
      prenom      = $('#estimation-prenom').val(),
      adresse     = $('#estimation-adresse').val(),
      cp          = $('#estimation-cp').val(),
      ville       = $('#estimation-ville').val(),
      tel         = $('#estimation-tel').val(),
      fax         = $('#estimation-fax').val(),
      mail        = $('#estimation-mail').val(),
      type        = $('#estimation-type').val(),
      surface     = $('#estimation-surface').val(),
      terrain     = $('#estimation-terrain').val(),
      commune     = $('#estimation-commune').val(),
      description = $('#estimation-description').val(),
      client      = __dossier_client !== null ? __dossier_client : '';
  
  ajaxPOST({
    'data': {
      'dossier_client': client,
      'action':         'post_form_estimation',
      'nom':            nom,
      'prenom':         prenom,
      'adresse':        adresse,
      'cp':             cp,
      'ville':          ville,
      'tel':            tel,
      'fax':            fax,
      'mail':           mail,
      'type':           type,
      'surface':        surface,
      'terrain':        terrain,
      'commune':        commune,
      'description':    description
    }
  }, function(data) {
    //console.log(data);
    $('#estimation-modal').modal('toggle');
    
    var response_box  = $('#estimation-response'),
        response_text = response_box.find('p');
    
    response_text
      .addClass('text-' + data.status)
      .html(data.message);
    
    response_box
      .addClass('bg-' + data.status)
      .removeClass('hidden');
  });
});

/* ----------=[ MODULE(S) : coups_de_coeur ]=---------- */
$('.cc-switch-tab a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
  var target = $(e.target).attr("href");
  setImageDimensions($(target));
});

/* ----------=[ MODULE(S) : resultats ]=---------- */

// Click sur le boutton pour afficher / masquer la carte (format xs)
$(document).on('click', '#toggle_properties_map', function() {
  var properties_map = $('#properties_map');
  properties_map.toggleClass('hidden-xs');
  if(properties_map.hasClass('hidden-xs')) $(this).html('Afficher la carte');
  else {
    $(this).html('Masquer la carte');
    PGL.propertiesMap(properties, "properties_map");
  }
});

// Choix du tri ou de l'ordre
$(document).on('change', '#tri, #ordre', function() {
  var tri       = $('#tri').val(),
      ordre     = $('#ordre').val(),
      nb_result = $('#nb_resultats'),
  
      container = $('#properties_list'),

      templates = $('.properties-full .listing-header .list-icons li.active a').attr('id').split('-'),
      template  = templates[1],

      client    = __dossier_client !== null ? __dossier_client : '';
  
  if(template == 'map') container = $('#properties_map_grid');
  
  var list = container.find('.pgl-property').get();
  
  properties.sort(propertiesSort(tri, ordre));
  
  if(template == 'map') {
    if(container.is(":visible")) map_grid_properties(properties, container);
    else map_grid_properties(properties, $('#xs-properties_map_grid'));
  } else {
    var nb_resultats = nb_resultats_page;
    if(nb_result.length) nb_resultats = nb_result.val();
    displayProperties(properties, container, template, parseInt(nb_resultats));
  }
  
  ajaxPOST({
    'data': {
      'dossier_client': client,
      'action':         'set_tri_session',
      'tri':            tri,
      'ordre':          ordre
    }
  }, function(data) {
    if(data.tri || data.ordre) console.info('-----=[ Changement ctrières de tri ]=-----');
    if(data.tri) console.info('Tri : ' + tri);
    if(data.ordre) console.info('Ordre : ' + ordre);
  })
});

// Choix du nombre de biens à afficher par page
$(document).on('change', '#nb_resultats', function() {
  var nb_result = $('#nb_resultats').val(),
  
      templates = $('.properties-full .listing-header .list-icons li.active a').attr('id').split('-'),
      template  = templates[1],

      client    = __dossier_client !== null ? __dossier_client : '';
  
  displayProperties(properties, $('#properties_list'), template, parseInt(nb_result));

  ajaxPOST({
    'data': {
      'dossier_client': client,
      'action':         'set_tri_session',
      'nb_result':      nb_result
    }
  }, function(data) {
    if(data.nb_result) {
      console.info('-----=[ Changement ctrières de tri ]=-----');
      console.info('Nb résultats / page : ' + nb_result);
    }
  })
});

// Choix du template d'affichage des biens (list | grid | map)
$(document).on('click', '[id^=resultats_template-]', function() {
  var id           = $(this).attr('id').split('-'),
      template     = id[1],
  
      old          = $(this).parent().parent().find('.active a').attr('id').split('-'),
      old_template = old[1],

      client       = __dossier_client !== null ? __dossier_client : '';
  
  $(this).parent().parent().find('.active').removeClass('active');
  $(this).parent().addClass('active');
  
  if(template == 'map' || old_template == 'map') {
    changeUrlParameters({
      0: {
        nom: "template_resultats",
        val: template
      }
    });
  } else {
    var main_container = $('.properties-full');
    var list = $('#properties_list');
    if(template === 'grid' || template === 'tblr_grid') {
      main_container.removeClass('properties-listing');
      main_container.removeClass('properties-listfull');
      list.addClass('row');
    } else {
      main_container.addClass('properties-listing properties-listfull');
      list.removeClass('row');
    }
    
    var nb_resultats = nb_resultats_page;
    var nb_results = $('#nb_resultats');
    if(nb_results.length) nb_resultats = nb_results.val();
    displayProperties(properties, list, template, parseInt(nb_resultats));
  }

  ajaxPOST({
    'data': {
      'dossier_client': client,
      'action':         'set_template_session',
      'template':       template
    }
  }, function(data) {
    if(data.template) {
      console.info('-----=[ Changement template d\'affichage ]=-----');
      console.info('Template : ' + template);
    }
  })
});

/* ----------=[ MODULE(S) : fiche ]=---------- */

// Ouverture de l'acordéon de localisation du bien
$(document).on('shown.bs.collapse', '#collapseMap', function(e) {
  initFicheMap();
});

// Action lors de l'impression de la page
window.print_function = window.print;
window.print = function() {
  var mapPanel = $('#collapseMap');
  if(mapPanel.length) {
    mapPanel.collapse('show');
    initFicheMap();
  }
  setTimeout(function() {
    window.print_function();
    mapPanel.collapse('hide');
  }, 2000);
};