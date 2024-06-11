import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './inscription.css';
import logo from './logo.png';
import { v4 as uuidv4 } from 'uuid';
import { FaEye, FaEyeSlash, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faEnvelope, faSignInAlt, faUserPlus, faLanguage } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import i18n from '../utils/i18n.js';

const Inscription = () => {
  const { t, i18n } = useTranslation('ins');
  const navigate = useNavigate();
  const footerRef = useRef();

  const [userType, setUserType] = useState('');
  const languages = ['English', 'Français', 'عربى'];
  const [activeNavItem, setActiveNavItem] = useState(null);
  const [languageDropdownVisible, setLanguageDropdownVisible] = useState(false);
  const [registrationDropdownVisible, setRegistrationDropdownVisible] = useState(false);
  const [selectedRegistrationType, setSelectedRegistrationType] = useState(null);
  const [apprenantData, setApprenantData] = useState({
    nom: '',
    email: '',
    mdp: '',
    role: 'apprenant',
    langue: '',
    statut: '',
    niveau: '',
    ville: '',
    dateNaiss: '',
  });
  const [instructeurData, setInstructeurData] = useState({
    nom: '',
    email: '',
    mdp: '',
    role: 'instructeur',
    langue: '',
    poste: '',
    etablissement: '',
    specialite: '',
    niveau: '',
    tel: '',
  });
  const [adminData, setAdminData] = useState({
    role: 'admin',
    langue: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleNavItemClick = (item) => {
    setActiveNavItem(item);
    setLanguageDropdownVisible(false);
  };

  const toggleLanguageDropdown = () => {
    setLanguageDropdownVisible(!languageDropdownVisible);
  };

  const handleRegistrationTypeClick = (type) => {
    setSelectedRegistrationType(type);
    setRegistrationDropdownVisible(false);
    navigate(`/inscrire/${type.toLowerCase()}`);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e, setData) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const checkEmailExists = async (email, role) => {
    try {
      let url = 'http://localhost:3001/api/checkEmailExistsA';
      if (role === 'instructeur') {
        url = 'http://localhost:3001/api/checkEmailExistsI';
      } else if (role === 'admin') {
        url = 'http://localhost:3001/api/checkEmailExistsAd';
      }

      const response = await axios.post(url, { email });
      return response.data.exists;
    } catch (error) {
      console.error(t('Erreur lors de la vérification de l\'existence de l\'e-mail :', error));
      return false;
    }
  };

  const handleSubmit = async (e, data, url, resetData, successMessage, errorMessage) => {
    e.preventDefault();

    if (Object.values(data).some((value) => value === '')) {
      toast.error(t('Veuillez remplir tous les champs.'));
      return;
    }

    const emailExists = await checkEmailExists(data.email, data.role);

    if (emailExists) {
      toast.error(t('L\'adresse e-mail existe déjà. Merci de la changer.'));
      return;
    }

    try {
      const response = await axios.post(url, { ...data, id: uuidv4() });

      if (response.data === 'Email déjà existant') {
        toast.error(t('L\'adresse e-mail existe déjà. Merci de la changer.'));
      } else {
        toast.success(successMessage);
        navigate('/login');
        resetData();
      }
    } catch (error) {
      console.error(t('Erreur lors de l\'envoi des données au serveur :', error));
      toast.error(errorMessage);
    }
  };

  const handleSubmitA = (e) => handleSubmit(
    e,
    apprenantData,
    'http://localhost:3001/api/registerA',
    () => setApprenantData({
      nom: '',
      email: '',
      mdp: '',
      role: 'apprenant',
      langue: '',
      statut: '',
      niveau: '',
      ville: '',
      dateNaiss: '',
    }),
    t('Inscription apprenant réussie !'),
    t('Erreur lors de l\'inscription apprenant')
  );

  const handleSubmitI = (e) => handleSubmit(
    e,
    instructeurData,
    'http://localhost:3001/api/registerI',
    () => setInstructeurData({
      nom: '',
      email: '',
      mdp: '',
      role: 'instructeur',
      langue: '',
      poste: '',
      etablissement: '',
      specialite: '',
      niveau: '',
      tel: '',
    }),
    t('Inscription instructeur réussie !'),
    t('Erreur lors de l\'inscription instructeur')
  );

  const handleSubmitAdmin = (e) => handleSubmit(
    e,
    adminData,
    'http://localhost:3001/api/registerAd',
    () => setAdminData({
      role: 'admin',
      langue: '',
    }),
    t('Inscription administrateur réussie !'),
    t('Erreur lors de l\'inscription administrateur')
  );

  const renderUserSpecificFields = () => {
    if (!userType) {
      return (
        <div className="inscription-form-container">
          <div>
            <h1>{t('accueil')}</h1>
            <br /><br /><br />
            <button className="orange-button" onClick={() => handleUserTypeChange('apprenant')}>
              <FaUserGraduate /> <b>{t('etudiant')}</b>
            </button> <br /><br />
            <button className="orange-button" onClick={() => handleUserTypeChange('instructeur')}>
              <FaChalkboardTeacher /> <b>{t('enseignant')}</b>
            </button> <br /><br />
            <img src={logo} alt="Intellego Logo" className="logo" />
          </div>
        </div>
      );
    }

    const commonFields = (
      <label key="langue">
        {t('langue')}: <br />
        <select
          name="langue"
          value={userType === 'apprenant' ? apprenantData.langue : (userType === 'instructeur' ? instructeurData.langue : adminData.langue)}
          onChange={(e) => handleInputChange(e, userType === 'apprenant' ? setApprenantData : (userType === 'instructeur' ? setInstructeurData : setAdminData))}
          required
          className="form-input"
        >
          <option value="" disabled>{t('Sélectionner une langage')}</option>
          <option value="Anglais">{t('anglais')}</option>
          <option value="Français">{t('francais')}</option>
          <option value="Arabe">{t('arabe')}</option>
        </select>
      </label>
    );
    

    const userSpecificFields = {
      apprenant: [
        commonFields,
        <label key="dateNaiss">
          {t('dateNaiss')}: <br />
          <input
            type="date"
            name="dateNaiss"
            value={apprenantData.dateNaiss}
            onChange={(e) => handleInputChange(e, setApprenantData)}
            required
            className="form-input"
            placeholder={t('Entrer la date de naissance')}
          />
        </label>,
        <label key="statut">
  {t('statut')}: <br />
  <select
    name="statut"
    value={apprenantData.statut}
    onChange={(e) => handleInputChange(e, setApprenantData)}
    required
    className="form-input"
  >
    <option value="">{t('selectionnez Statut')}</option>
    <option value="Ingénieur">{t('ingenieur')}</option>
    <option value="Développeur">{t('developpeur')}</option>
    <option value="Etudiant">{t('etudiant')}</option>
    <option value="Autre">{t('autre')}</option>
  </select>
</label>
,
        <label key="niveau">
        {t('niveau')}: <br />
        <select
          name="niveau"
          value={instructeurData.niveau}
          onChange={(e) => handleInputChange(e, setInstructeurData)}
          required
          className="form-input"
        >
          <option value="">{t('selectionnez Niveau')}</option>
          <option value="débutant">{t('debutant')}</option>
          <option value="intermédiaire">{t('intermediaire')}</option>
          <option value="avancé">{t('avance')}</option>
        </select>
      </label>
      ,
        <label key="ville">
          {t('ville')}: <br />
          <input
            type="text"
            name="ville"
            value={apprenantData.ville}
            onChange={(e) => handleInputChange(e, setApprenantData)}
            required
            className="form-input"
            placeholder={t('Entrer la ville')}
          />
        </label>,
        
    
      ],
      instructeur: [
        commonFields,
        <label key="poste">
  {t('poste')}: <br />
  <select
    name="poste"
    value={instructeurData.poste}
    onChange={(e) => handleInputChange(e, setInstructeurData)}
    required
    className="form-input"
  >
    <option value="">{t('selectionnez Poste')}</option>
    <option value="enseignant">{t('enseignant')}</option>
    <option value="formateur professionnel">{t('formateur Professionnel')}</option>
    <option value="ingénieur">{t('ingenieur')}</option>
    <option value="autre">{t('autre')}</option>
  </select>
</label>,

        <label key="etablissement">
          {t('etablissement')}: <br />
          <input
            type="text"
            name="etablissement"
            value={instructeurData.etablissement}
            onChange={(e) => handleInputChange(e, setInstructeurData)}
            required
            className="form-input"
            placeholder={t('Entrer l\'établissement')}
          />
        </label>,
        <label key="specialite">
          {t('specialite')}: <br />
          <input
            type="text"
            name="specialite"
            value={instructeurData.specialite}
            onChange={(e) => handleInputChange(e, setInstructeurData)}
            required
            className="form-input"
            placeholder={t('Entrer la spécialité')}
          />
        </label>,
    <label key="niveau">
    {t('niveau')}: <br />
    <select
      name="niveau"
      value={instructeurData.niveau}
      onChange={(e) => handleInputChange(e, setInstructeurData)}
      required
      className="form-input"
    >
      <option value="">{t('selectionnez Niveau')}</option>
      <option value="débutant">{t('debutant')}</option>
      <option value="intermédiaire">{t('intermediaire')}</option>
      <option value="avancé">{t('avance')}</option>
    </select>
  </label>
  ,
        <label key="tel">
          {t('tel')}: <br />
          <input
            type="text"
            name="tel"
            value={instructeurData.tel}
            onChange={(e) => handleInputChange(e, setInstructeurData)}
            required
            className="form-input"
            placeholder={t('Entrer le téléphone')}
          />
        </label>,
      ],
      admin: [commonFields],
    };

    const handleSubmitFn = {
      apprenant: handleSubmitA,
      instructeur: handleSubmitI,
      admin: handleSubmitAdmin,
    };

    const userData = {
      apprenant: apprenantData,
      instructeur: instructeurData,
      admin: adminData,
    };

    return (
      <div className="inscription-form-container">
        <form onSubmit={handleSubmitFn[userType]}>
         
          <h1>{t('Bienvenue')}</h1>
          <label>
            {t('nom')}: <br />
            <input
              type="text"
              name="nom"
              value={userData[userType].nom}
              onChange={(e) => handleInputChange(e, userType === 'apprenant' ? setApprenantData : (userType === 'instructeur' ? setInstructeurData : setAdminData))}
              required
              className="form-input"
              placeholder={t('Entrer le nom')}
            />
          </label>
          <label>
            {t('email')}: <br />
            <input
              type="email"
              name="email"
              value={userData[userType].email}
              onChange={(e) => handleInputChange(e, userType === 'apprenant' ? setApprenantData : (userType === 'instructeur' ? setInstructeurData : setAdminData))}
              required
              className="form-input"
              placeholder={t('Entrer l\'adresse e-mail')}
            />
          </label>
          
          <label>
            {t('mdp')}: <br />
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="mdp"
                value={userData[userType].mdp}
                onChange={(e) => handleInputChange(e, userType === 'apprenant' ? setApprenantData : (userType === 'instructeur' ? setInstructeurData : setAdminData))}
                required
                className="form-input"
                placeholder={t('Entrer le mot de passe')}
              />
              <span className="password-toggle-icon" onClick={handleTogglePassword}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </label>
          {userSpecificFields[userType]}
          <button type="submit" className="orange-button">{t('inscrire')}</button>
        </form>
        <img src={logo} alt="Intellego Logo" className="logo" />
      </div>
    );
  };


  const handleNavClick = (path) => {
    handleNavItemClick(path);
    navigate(path);
  };

  const ChangeEn = () => {
    i18n.changeLanguage("en");
  };

  const ChangeFr = () => {
    i18n.changeLanguage("fr");
  };

  const ChangeAr = () => {
    i18n.changeLanguage("ar");
  };


  return (
    <div>
      <header>
     
<div className="navbar">
        <div className="left-links">
          <h4 className="titre">Intellego</h4> &nbsp; &nbsp; &nbsp;
          <div
        className={`nav-item ${activeNavItem === 'home' ? 'active' : ''}`}
        onClick={() => handleNavClick('/')}
      >
        <FontAwesomeIcon icon={faHome} /> {t('accueil')}
      </div>
          
        </div>
        <div className="right-links">
          
          
          <div
            className={`nav-item ${activeNavItem === 'language' ? 'active' : ''}`}
            onClick={() => {
              handleNavItemClick('language');
              toggleLanguageDropdown();
            }}
          >
            <FontAwesomeIcon icon={faLanguage} /> {t('langue')}
            {languageDropdownVisible && (
              <div className="language-dropdown">
                <ul>
                  <li onClick={ChangeEn}>{t('anglais')}</li>
                  <li onClick={ChangeFr}>{t('francais')}</li>
                  <li onClick={ChangeAr}>{t('arabe')}</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <br />
      </header>
      <div>
        <ToastContainer />
        {renderUserSpecificFields()}
      </div>
     
    </div>
  );
};

export default Inscription;
