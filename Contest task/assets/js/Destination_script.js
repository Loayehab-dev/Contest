
(function ($) {
  "use strict";


  const DESTINATIONS = [
    "Bali [Indonesia]",
    "New Zealand",
    "USA [United States]",
    "United Kingdom",
    "Austria",
    "Canada",
    "World Wide",
    "All of Europe",
    "All of Asia"
  ];

  const KEYS = {
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    UP: 38,
    DOWN: 40,
    TAB: 9
  };

  class DestinationDropdown {
    constructor(element) {
      this.$wrapper = $(element);
      this.$input = this.$wrapper.find(".destination-input");
      this.$toggleBtn = this.$wrapper.find(".dropdown-toggle-btn");
      this.$dropdown = this.$wrapper.find(".dropdown-menu-custom");
      this.$itemsWrapper = this.$wrapper.find(".dropdown-items-wrapper");
      this.$chipsContainer = this.$wrapper.find(".selected-chips-container");

      this.selectedDestinations = new Set();
      this.allDestinations = [...DESTINATIONS];
      this.filteredDestinations = [...DESTINATIONS];
      this.focusedIndex = -1;
      this.isOpen = false;

      this.init();
    }

    init() {
      this.renderDropdownItems();
      this.attachEventListeners();
      this.setupAccessibility();
    }

    
    renderDropdownItems() {
      const $itemsWrapper = this.$itemsWrapper;
      $itemsWrapper.empty();

      if (this.filteredDestinations.length === 0) {
        this.$dropdown.addClass("empty-state");
        $itemsWrapper.html(
          '<div class="empty-message">Destination not found</div>'
        );
        return;
      }

      this.$dropdown.removeClass("empty-state");

      this.filteredDestinations.forEach((destination, index) => {
        const isSelected = this.selectedDestinations.has(destination);
        const $item = $("<div>", {
          class: "dropdown-item-custom" + (isSelected ? " selected" : ""),
          role: "option",
          tabindex: index === 0 ? "0" : "-1",
          "data-value": destination,
          "aria-selected": isSelected ? "true" : "false"
        }).text(destination);

        $itemsWrapper.append($item);
      });

      const dividerIndex = this.filteredDestinations.findIndex(
        (dest) =>
          dest === "World Wide" ||
          dest === "All of Europe" ||
          dest === "All of Asia"
      );

      if (dividerIndex > 0) {
        $itemsWrapper
          .children()
          .eq(dividerIndex)
          .before('<div class="dropdown-divider-custom"></div>');
      }
    }

    renderSelectedChips() {
      if (!this.$chipsContainer.length) return;

      this.$chipsContainer.empty();

      this.selectedDestinations.forEach((destination) => {
        const $chip = $("<div>", { class: "destination-chip" });
        const $text = $("<span>", { class: "chip-text" }).text(destination);
        const $removeBtn = $("<button>", {
          type: "button",
          class: "chip-remove-btn",
          "aria-label": `Remove ${destination}`
        }).html(`
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M9 3L3 9M3 3L9 9" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `);

        $removeBtn.on("click", (e) => {
          e.stopPropagation();
          this.removeDestination(destination);
        });

        $chip.append($text, $removeBtn);
        this.$chipsContainer.append($chip);
      });
    }


    openDropdown() {
      if (this.isOpen) return;

      this.isOpen = true;
      this.$dropdown.addClass("show");
      this.$toggleBtn.addClass("active").attr("aria-expanded", "true");
      this.$input.attr("aria-expanded", "true");
      this.focusedIndex = 0;
      this.updateFocusedItem();

      // Announce to screen readers
      this.announceToScreenReader(
        `Dropdown opened. ${this.filteredDestinations.length} destinations available.`
      );
    }

    closeDropdown() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.$dropdown.removeClass("show");
      this.$toggleBtn.removeClass("active").attr("aria-expanded", "false");
      this.$input.attr("aria-expanded", "false");
      this.focusedIndex = -1;
      this.updateFocusedItem();
    }

    toggleDropdown() {
      if (this.isOpen) {
        this.closeDropdown();
      } else {
        this.openDropdown();
      }
    }

    selectDestination(destination) {
      if (this.selectedDestinations.has(destination)) {
        this.announceToScreenReader(`${destination} is already selected.`);
        return;
      }

      this.selectedDestinations.add(destination);
      this.renderSelectedChips();
      this.renderDropdownItems();
      this.$input.val("").trigger("input");

      this.announceToScreenReader(
        `${destination} selected. ${
          this.selectedDestinations.size
        } destination${
          this.selectedDestinations.size !== 1 ? "s" : ""
        } selected.`
      );
    }

    removeDestination(destination) {
      this.selectedDestinations.delete(destination);
      this.renderSelectedChips();
      this.renderDropdownItems();

      this.announceToScreenReader(
        `${destination} removed. ${this.selectedDestinations.size} destination${
          this.selectedDestinations.size !== 1 ? "s" : ""
        } selected.`
      );
    }


    filterDestinations(searchTerm) {
      const term = searchTerm.toLowerCase().trim();

      if (!term) {
        this.filteredDestinations = [...this.allDestinations];
      } else {
        this.filteredDestinations = this.allDestinations.filter((destination) =>
          destination.toLowerCase().includes(term)
        );
      }

      this.renderDropdownItems();
      this.focusedIndex = 0;
      this.updateFocusedItem();

      if (this.filteredDestinations.length === 0) {
        this.announceToScreenReader("No destinations found.");
      } else {
        this.announceToScreenReader(
          `${this.filteredDestinations.length} destination${
            this.filteredDestinations.length !== 1 ? "s" : ""
          } found.`
        );
      }
    }


    handleKeyDown(e) {
      if (!this.isOpen) {
        if (
          e.keyCode === KEYS.DOWN ||
          e.keyCode === KEYS.UP ||
          e.keyCode === KEYS.ENTER
        ) {
          e.preventDefault();
          this.openDropdown();
        }
        return;
      }

      switch (e.keyCode) {
        case KEYS.DOWN:
          e.preventDefault();
          this.moveFocus(1);
          break;
        case KEYS.UP:
          e.preventDefault();
          this.moveFocus(-1);
          break;
        case KEYS.ENTER:
          e.preventDefault();
          this.selectFocusedItem();
          break;
        case KEYS.ESCAPE:
          e.preventDefault();
          this.closeDropdown();
          this.$input.focus();
          break;
        case KEYS.TAB:
          this.closeDropdown();
          break;
      }
    }

    moveFocus(direction) {
      const itemCount = this.filteredDestinations.length;
      if (itemCount === 0) return;

      this.focusedIndex =
        (this.focusedIndex + direction + itemCount) % itemCount;
      this.updateFocusedItem();
      this.scrollToFocusedItem();
    }

    updateFocusedItem() {
      const $items = this.$itemsWrapper.find(".dropdown-item-custom");

      $items.attr("tabindex", "-1").removeClass("focused");

      if (this.focusedIndex >= 0 && this.focusedIndex < $items.length) {
        const $focusedItem = $items.eq(this.focusedIndex);
        $focusedItem.attr("tabindex", "0").addClass("focused");
      }
    }

    scrollToFocusedItem() {
      const $items = this.$itemsWrapper.find(".dropdown-item-custom");
      if (this.focusedIndex < 0 || this.focusedIndex >= $items.length) return;

      const $focusedItem = $items.eq(this.focusedIndex);
      const itemTop = $focusedItem.position().top;
      const itemHeight = $focusedItem.outerHeight();
      const wrapperHeight = this.$itemsWrapper.height();
      const scrollTop = this.$itemsWrapper.scrollTop();

      if (itemTop < 0) {
        this.$itemsWrapper.scrollTop(scrollTop + itemTop);
      } else if (itemTop + itemHeight > wrapperHeight) {
        this.$itemsWrapper.scrollTop(
          scrollTop + itemTop + itemHeight - wrapperHeight
        );
      }
    }

    selectFocusedItem() {
      if (
        this.focusedIndex >= 0 &&
        this.focusedIndex < this.filteredDestinations.length
      ) {
        const destination = this.filteredDestinations[this.focusedIndex];
        this.selectDestination(destination);
      }
    }


    attachEventListeners() {
      // Toggle button click
      this.$toggleBtn.on("click", (e) => {
        e.stopPropagation();
        this.toggleDropdown();
        if (this.isOpen) {
          this.$input.focus();
        }
      });

      this.$input.on("focus", () => {
        if (!this.isOpen) {
          this.openDropdown();
        }
      });

      this.$input.on("input", (e) => {
        const value = $(e.target).val();
        this.filterDestinations(value);
        if (!this.isOpen) {
          this.openDropdown();
        }
      });

      this.$input.on("keydown", (e) => {
        this.handleKeyDown(e);
      });

      this.$itemsWrapper.on("click", ".dropdown-item-custom", (e) => {
        const destination = $(e.currentTarget).data("value");
        if (destination) {
          this.selectDestination(destination);
        }
      });

      this.$itemsWrapper.on("keydown", ".dropdown-item-custom", (e) => {
        if (e.keyCode === KEYS.ENTER || e.keyCode === KEYS.SPACE) {
          e.preventDefault();
          const destination = $(e.currentTarget).data("value");
          if (destination) {
            this.selectDestination(destination);
          }
        }
      });

      $(document).on("click", (e) => {
        if (
          !this.$wrapper.is(e.target) &&
          this.$wrapper.has(e.target).length === 0
        ) {
          this.closeDropdown();
        }
      });
    }

    
    setupAccessibility() {
      // Create live region for screen reader announcements
      if ($("#dropdown-announcer").length === 0) {
        $("body").append(
          '<div id="dropdown-announcer" class="visually-hidden" role="status" aria-live="polite" aria-atomic="true"></div>'
        );
      }
    }

    announceToScreenReader(message) {
      const $announcer = $("#dropdown-announcer");
      $announcer.text("");
      setTimeout(() => {
        $announcer.text(message);
      }, 100);
    }
  }

  
  $(document).ready(function () {
    // Initialize the interactive demo
    const $interactiveDemo = $("#interactiveDemo");
    if ($interactiveDemo.length) {
      new DestinationDropdown($interactiveDemo);
    }

    $("html").css("scroll-behavior", "smooth");

    if ("loading" in HTMLImageElement.prototype) {
      const images = document.querySelectorAll("img[data-src]");
      images.forEach((img) => {
        img.src = img.dataset.src;
      });
    }

    $(document).on("keydown", function (e) {
      if (e.keyCode === KEYS.TAB) {
        $("body").addClass("keyboard-navigation");
      }
    });

    $(document).on("mousedown", function () {
      $("body").removeClass("keyboard-navigation");
    });

  });
})(jQuery);
