// Add skill level tooltips for better usability
document.addEventListener('DOMContentLoaded', function() {
  // Find all skill level indicators
  const skillLevelIndicators = document.querySelectorAll('.skill-level-indicator');
  
  // Add tooltips to each skill level indicator
  skillLevelIndicators.forEach(indicator => {
    // Determine skill level based on class
    let skillLevel = '';
    if (indicator.classList.contains('skill-level-expert')) {
      skillLevel = 'Expert';
    } else if (indicator.classList.contains('skill-level-advanced')) {
      skillLevel = 'Advanced';
    } else if (indicator.classList.contains('skill-level-intermediate')) {
      skillLevel = 'Intermediate';
    }
    
    // Add tooltip attribute
    indicator.setAttribute('data-tooltip', skillLevel);
    indicator.setAttribute('aria-label', skillLevel + ' level');
    
    // Add event listeners for tooltip
    const parentSkillItem = indicator.closest('.skill-item');
    if (parentSkillItem) {
      parentSkillItem.addEventListener('mouseenter', () => {
        showSkillTooltip(indicator, skillLevel);
      });
      
      parentSkillItem.addEventListener('mouseleave', () => {
        hideSkillTooltip();
      });
      
      // For accessibility (keyboard navigation)
      parentSkillItem.addEventListener('focus', () => {
        showSkillTooltip(indicator, skillLevel);
      });
      
      parentSkillItem.addEventListener('blur', () => {
        hideSkillTooltip();
      });
    }
  });
  
  // Create tooltip element
  let tooltip = document.createElement('div');
  tooltip.className = 'skill-tooltip';
  document.body.appendChild(tooltip);
  
  // Show tooltip function
  function showSkillTooltip(element, text) {
    const rect = element.getBoundingClientRect();
    tooltip.textContent = text;
    tooltip.style.top = rect.top + window.scrollY - 35 + 'px';
    tooltip.style.left = rect.right + window.scrollX - 30 + 'px';
    tooltip.classList.add('show');
  }
  
  // Hide tooltip function
  function hideSkillTooltip() {
    tooltip.classList.remove('show');
  }
  
  // Add skill level percentage text to each skill in a skill bar format
  const skillItems = document.querySelectorAll('.skill-item');
  
  skillItems.forEach(item => {
    // Get the skill level
    const indicator = item.querySelector('.skill-level-indicator');
    if (indicator) {
      let percentage = '0%';
      
      if (indicator.classList.contains('skill-level-expert')) {
        percentage = '95%';
      } else if (indicator.classList.contains('skill-level-advanced')) {
        percentage = '80%';
      } else if (indicator.classList.contains('skill-level-intermediate')) {
        percentage = '60%';
      }
      
      // Add skill bar element
      const skillBar = document.createElement('div');
      skillBar.className = 'skill-bar';
      
      const skillProgress = document.createElement('div');
      skillProgress.className = 'skill-progress';
      skillProgress.style.width = percentage;
      
      const skillPercentage = document.createElement('span');
      skillPercentage.className = 'skill-percentage';
      skillPercentage.textContent = percentage;
      
      skillBar.appendChild(skillProgress);
      item.appendChild(skillBar);
      
      // Add the percentage to the skill name element
      const skillName = item.querySelector('.skill-name');
      if (skillName) {
        skillName.appendChild(skillPercentage);
      }
    }
  });
});