
(function($) {
  'use strict';

  const destinations = [
    'Austria', 'Australia', 'Bali (Indonesia)', 'Belgium', 'Brazil', 
    'Canada', 'China', 'Croatia', 'Czech Republic', 'Denmark',
    'Egypt', 'Finland', 'France', 'Germany', 'Greece',
    'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia',
    'Ireland', 'Italy', 'Japan', 'Malaysia', 'Mexico',
    'Netherlands', 'New Zealand', 'Norway', 'Poland', 'Portugal',
    'Singapore', 'South Korea', 'Spain', 'Sweden', 'Switzerland',
    'Thailand', 'Turkey', 'United Arab Emirates', 'United Kingdom', 'United States'
  ];

  let selectedDestinations = ['Austria', 'Bali (Indonesia)', 'Canada'];
  let travellerAges = [];


  function init() {
    setupDestinationDropdown();
    setupDatePickers();
    setupAgeInput();
    setupFormValidation();
    setupMegaMenu();
    renderSelectedDestinations();
    setupAccessibility();
  }

  
  function setupDestinationDropdown() {
    const $destinationInput = $('#destination-input');
    const $dropdownBtn = $('#destination-dropdown-btn');
    const $dropdown = $('#destination-dropdown');
    const $destinationList = $('#destination-list');
    const $searchInput = $('#destination-search');

    renderDestinationList(destinations);

    $dropdownBtn.on('click', function(e) {
      e.stopPropagation();
      const isOpen = $dropdown.hasClass('show');
      $dropdown.toggleClass('show');
      $(this).attr('aria-expanded', !isOpen);
    });

    $searchInput.on('input', function() {
      const searchTerm = $(this).val().toLowerCase();
      const filtered = destinations.filter(dest => 
        dest.toLowerCase().includes(searchTerm)
      );
      renderDestinationList(filtered);
    });

    $destinationList.on('click', 'li', function() {
      const destination = $(this).text();
      if (!selectedDestinations.includes(destination)) {
        selectedDestinations.push(destination);
        renderSelectedDestinations();
        renderDestinationList(destinations);
      }
    });

    $(document).on('click', function(e) {
      if (!$(e.target).closest('.destination-input-wrapper').length) {
        $dropdown.removeClass('show');
        $dropdownBtn.attr('aria-expanded', 'false');
      }
    });

    $destinationInput.on('focus', function() {
      $dropdown.addClass('show');
      $dropdownBtn.attr('aria-expanded', 'true');
    });
  }

 
  function renderDestinationList(list) {
    const $destinationList = $('#destination-list');
    $destinationList.empty();

    if (list.length === 0) {
      $destinationList.append('<li class="text-muted">No destinations found</li>');
      return;
    }

    list.forEach(destination => {
      const isSelected = selectedDestinations.includes(destination);
      const $li = $('<li></li>')
        .text(destination)
        .toggleClass('selected', isSelected);
      
      if (isSelected) {
        $li.append(' <small>(Selected)</small>');
      }
      
      $destinationList.append($li);
    });
  }

 
  function renderSelectedDestinations() {
    const $container = $('#selected-destinations');
    $container.empty();

    selectedDestinations.forEach(destination => {
      const $tag = $(`
        <div class="destination-tag fade-in">
          <span>${destination}</span>
          <button type="button" class="btn-remove-destination" data-destination="${destination}" aria-label="Remove ${destination}">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      `);
      $container.append($tag);
    });

    $('.btn-remove-destination').on('click', function() {
      const destination = $(this).data('destination');
      selectedDestinations = selectedDestinations.filter(d => d !== destination);
      renderSelectedDestinations();
      renderDestinationList(destinations);
    });
  }

  
  function setupDatePickers() {
    const $departureDate = $('#departure-date');
    const $returnDate = $('#return-date');

    function formatDateInput($input) {
      $input.on('input', function(e) {
        let value = $(this).val().replace(/\D/g, '');
        
        if (value.length >= 2) {
          value = value.slice(0, 2) + '/' + value.slice(2);
        }
        if (value.length >= 5) {
          value = value.slice(0, 5) + '/' + value.slice(5, 9);
        }
        
        $(this).val(value);
      });

      $input.on('blur', function() {
        validateDate($(this));
      });
    }

    formatDateInput($departureDate);
    formatDateInput($returnDate);

    function validateDate($input) {
      const value = $input.val();
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      
      if (value && !dateRegex.test(value)) {
        $input.addClass('is-invalid');
        showError($input, 'Please enter a valid date (DD/MM/YYYY)');
      } else {
        $input.removeClass('is-invalid');
        hideError($input);
      }
    }
  }

  
  function setupAgeInput() {
    const $ageInput = $('#traveller-age');
    const $addAgeBtn = $('#add-age-btn');
    const $agesList = $('#traveller-ages-list');

    $addAgeBtn.on('click', function() {
      const age = parseInt($ageInput.val());
      
      if (!age || age < 0 || age > 120) {
        $ageInput.addClass('is-invalid');
        showError($ageInput, 'Please enter a valid age (0-120)');
        return;
      }

      travellerAges.push(age);
      $ageInput.val('').removeClass('is-invalid');
      hideError($ageInput);
      renderTravellerAges();
    });

    $ageInput.on('keypress', function(e) {
      if (e.which === 13) {
        e.preventDefault();
        $addAgeBtn.click();
      }
    });

    function renderTravellerAges() {
      $agesList.empty();

      travellerAges.forEach((age, index) => {
        const $tag = $(`
          <div class="age-tag fade-in">
            <span>${age} years</span>
            <button type="button" class="btn-remove-age" data-index="${index}" aria-label="Remove age ${age}">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        `);
        $agesList.append($tag);
      });

      $('.btn-remove-age').on('click', function() {
        const index = $(this).data('index');
        travellerAges.splice(index, 1);
        renderTravellerAges();
      });
    }
  }


  function setupFormValidation() {
    $('#quoteForm').on('submit', function(e) {
      e.preventDefault();
      
      let isValid = true;
      const $form = $(this);

      $form.find('.is-invalid').removeClass('is-invalid');
      $form.find('.invalid-feedback').remove();

      if (selectedDestinations.length === 0) {
        const $destinationInput = $('#destination-input');
        $destinationInput.addClass('is-invalid');
        showError($destinationInput, 'Please select at least one destination');
        isValid = false;
      }

      const $departureDate = $('#departure-date');
      if (!$departureDate.val()) {
        $departureDate.addClass('is-invalid');
        showError($departureDate, 'Please enter departure date');
        isValid = false;
      }

      const $returnDate = $('#return-date');
      if (!$returnDate.val()) {
        $returnDate.addClass('is-invalid');
        showError($returnDate, 'Please enter return date');
        isValid = false;
      }

      if (travellerAges.length === 0) {
        const $ageInput = $('#traveller-age');
        $ageInput.addClass('is-invalid');
        showError($ageInput, 'Please add at least one traveller age');
        isValid = false;
      }

      if (isValid) {
        submitQuoteForm();
      } else {
        const $firstError = $form.find('.is-invalid').first();
        if ($firstError.length) {
          $('html, body').animate({
            scrollTop: $firstError.offset().top - 100
          }, 300);
        }
      }
    });
  }
  

  


  function setupMegaMenu() {
  
    $('.dropdown-menu.mega-menu').on('click', function(e) {
      e.stopPropagation();
    });

    $(document).on('click', function(e) {
      if (!$(e.target).closest('.dropdown').length) {
        $('.dropdown-menu').removeClass('show');
      }
    });
  }

  
  function setupAccessibility() {
    $('body').prepend('<a href="#quote-form" class="skip-link">Skip to main content</a>');

    $('.destination-list').on('keydown', 'li', function(e) {
      const $items = $('.destination-list li');
      const currentIndex = $items.index(this);

      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          $items.eq(currentIndex + 1).focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          $items.eq(currentIndex - 1).focus();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          $(this).click();
          break;
        case 'Escape':
          $('#destination-dropdown').removeClass('show');
          $('#destination-input').focus();
          break;
      }
    });

    $('.destination-list').on('mouseenter', 'li', function() {
      $(this).attr('tabindex', '0');
    });
  }

  
  $('a[href^="#"]').on('click', function(e) {
    const target = $(this.getAttribute('href'));
    if (target.length) {
      e.preventDefault();
      $('html, body').stop().animate({
        scrollTop: target.offset().top - 80
      }, 600);
    }
  });

  
  function lazyLoadImages() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

 
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  
  const handleResize = debounce(function() {
   
    console.log('Window resized');
  }, 250);

  $(window).on('resize', handleResize);

  
  $(document).ready(function() {
    init();
    lazyLoadImages();
    
    
    setTimeout(() => {
      $('body').addClass('loaded');
    }, 100);
  });

  
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        registration => {
          console.log('ServiceWorker registration successful');
        },
        err => {
          console.log('ServiceWorker registration failed: ', err);
        }
      );
    });
  }

})(jQuery);
