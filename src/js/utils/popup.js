export const createPopup = ({ titleText, onClose, onComplete, onContinue, onUndo, displayContinue = true }) => {
    const overlay = document.createElement('div');
    overlay.classList.add('candy-overlay');

    const popup = document.createElement('div');
    popup.classList.add('candy-popup');

    const popupHeader = document.createElement('div');
    popupHeader.classList.add('candy-popup-header');

    const popupBody = document.createElement('div');
    popupBody.classList.add('candy-popup-body');
    popupBody.style.overflow = 'auto';
    popupBody.style.scrollBehavior = 'smooth';

    const popupFooter = document.createElement('div');
    popupFooter.classList.add('candy-popup-footer');

    const closeButton = document.createElement('button');
    closeButton.classList.add('candy-button', 'close-button');
    closeButton.textContent = '닫기';

    const completeButton = document.createElement('button');
    completeButton.classList.add('candy-button', 'complete-button');
    completeButton.textContent = '완료';

    const undoButton = document.createElement('button');
    undoButton.classList.add('candy-undo-button');

    const loadingIcon = document.createElement('div');

    const candyIcon = document.createElement('div');
    candyIcon.classList.add('candy-icon');

    const myCredits = document.createElement('div');
    myCredits.classList.add('candy-my-credits');
    myCredits.innerText = 0;

    const title = document.createElement('h2');
    title.classList.add('popup-title');
    title.textContent = titleText;

    popupHeader.append(title, undoButton, candyIcon, myCredits);

    if (displayContinue) {
        const continueButton = document.createElement('button');
        continueButton.classList.add('candy-continue-button');
        popupHeader.appendChild(continueButton);

        continueButton.addEventListener('click', onContinue);
    }

    popupBody.appendChild(document.createElement('div')); // Popup content  
    popupFooter.append(completeButton, closeButton);
    popup.append(loadingIcon, popupHeader, popupBody, popupFooter);
    overlay.appendChild(popup);

    closeButton.addEventListener('click', onClose);
    completeButton.addEventListener('click', onComplete);
    undoButton.addEventListener('click', onUndo);

    document.body.appendChild(overlay);

    return {
        overlay,
        popupContent: popupBody,
        loadingIcon,
        myCredits,
        closePopup: () => document.body.removeChild(overlay),
    };
};