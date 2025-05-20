import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  TextField,
  Paper,
  Link,
  Grid,
  Avatar
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Help as HelpIcon,
    Book as BookIcon,
    Info as InfoIcon,
    Support as SupportIcon,
    CheckCircle as CheckCircleIcon,
    Settings as SettingsIcon,
    Dashboard as DashboardIcon,
    ShoppingCart as ShoppingCartIcon,
    Inventory as InventoryIcon,
    People as PeopleIcon,
    Receipt as ReceiptIcon,
    ContactSupport as ContactSupportIcon,
    Email as EmailIcon,
    Public as PublicIcon,
    Receipt
  } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

const HelpHome: React.FC = () => {
  const { theme, language, t } = useTheme();
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <HelpIcon sx={{ color: '#a855f7', mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
            {t.help.title}
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
          {t.help.description}
        </Typography>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="help center tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: theme === 'light' ? '#4A5568' : '#A0AEC0',
              },
              '& .Mui-selected': {
                color: '#a855f7',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#a855f7',
              },
            }}
          >
            <Tab 
              icon={<BookIcon />} 
              label={t.help.tabs.userManual} 
              iconPosition="start"
            />
            <Tab 
              icon={<HelpIcon />} 
              label={t.help.tabs.faq} 
              iconPosition="start"
            />
            <Tab 
              icon={<InfoIcon />} 
              label={t.help.tabs.about} 
              iconPosition="start"
            />
            <Tab 
              icon={<SupportIcon />} 
              label={t.help.tabs.support} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* User Manual Tab */}
        {currentTab === 0 && (
          <Box p={3}>
            <Typography variant="h5" gutterBottom sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
              {t.help.userManual.title}
            </Typography>
            <Typography paragraph sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
              {t.help.userManual.introduction}
            </Typography>

            <Accordion defaultExpanded sx={{ mb: 2, bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="dashboard-content"
                id="dashboard-header"
              >
                <Box display="flex" alignItems="center">
                  <DashboardIcon sx={{ color: '#a855f7', mr: 2 }} />
                  <Typography variant="h6" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                    {t.help.userManual.sections.dashboard.title}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                  {t.help.userManual.sections.dashboard.description}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#a855f7' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t.help.userManual.sections.dashboard.features.salesSummary.title} 
                      secondary={t.help.userManual.sections.dashboard.features.salesSummary.description} 
                      primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                      secondaryTypographyProps={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#a855f7' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t.help.userManual.sections.dashboard.features.inventoryStatus.title} 
                      secondary={t.help.userManual.sections.dashboard.features.inventoryStatus.description}
                      primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                      secondaryTypographyProps={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#a855f7' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t.help.userManual.sections.dashboard.features.recentOrders.title} 
                      secondary={t.help.userManual.sections.dashboard.features.recentOrders.description}
                      primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                      secondaryTypographyProps={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2, bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="pos-content"
                id="pos-header"
              >
                <Box display="flex" alignItems="center">
                  <ShoppingCartIcon sx={{ color: '#a855f7', mr: 2 }} />
                  <Typography variant="h6" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                    {t.help.userManual.sections.pos.title}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                  {t.help.userManual.sections.pos.description}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#a855f7' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t.help.userManual.sections.pos.features.productSelection.title} 
                      secondary={t.help.userManual.sections.pos.features.productSelection.description}
                      primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                      secondaryTypographyProps={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#a855f7' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t.help.userManual.sections.pos.features.customerSelection.title} 
                      secondary={t.help.userManual.sections.pos.features.customerSelection.description}
                      primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                      secondaryTypographyProps={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#a855f7' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t.help.userManual.sections.pos.features.paymentProcessing.title} 
                      secondary={t.help.userManual.sections.pos.features.paymentProcessing.description}
                      primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                      secondaryTypographyProps={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#a855f7' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t.help.userManual.sections.pos.features.orderCreation.title} 
                      secondary={t.help.userManual.sections.pos.features.orderCreation.description}
                      primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                      secondaryTypographyProps={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2, bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="inventory-content"
                id="inventory-header"
              >
                <Box display="flex" alignItems="center">
                  <InventoryIcon sx={{ color: '#a855f7', mr: 2 }} />
                  <Typography variant="h6" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                    {t.help.userManual.sections.inventory.title}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                  {t.help.userManual.sections.inventory.description}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#a855f7' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t.help.userManual.sections.inventory.features.productManagement.title} 
                      secondary={t.help.userManual.sections.inventory.features.productManagement.description}
                      primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                      secondaryTypographyProps={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#a855f7' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t.help.userManual.sections.inventory.features.categoryManagement.title} 
                      secondary={t.help.userManual.sections.inventory.features.categoryManagement.description}
                      primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                      secondaryTypographyProps={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#a855f7' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t.help.userManual.sections.inventory.features.stockAdjustments.title} 
                      secondary={t.help.userManual.sections.inventory.features.stockAdjustments.description}
                      primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                      secondaryTypographyProps={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            {/* Add remaining accordions for Orders, Customers, Settings following the same pattern */}
          </Box>
        )}

        {/* FAQ Tab */}
        {currentTab === 1 && (
          <Box p={3}>
            <Typography variant="h5" gutterBottom sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
              {t.help.faq.title}
            </Typography>

            <Accordion sx={{ mb: 2, bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="faq1-content"
                id="faq1-header"
              >
                <Typography variant="subtitle1" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                  {t.help.faq.questions.q1.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                  {t.help.faq.questions.q1.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2, bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="faq2-content"
                id="faq2-header"
              >
                <Typography variant="subtitle1" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                  {t.help.faq.questions.q2.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                  {t.help.faq.questions.q2.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2, bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="faq3-content"
                id="faq3-header"
              >
                <Typography variant="subtitle1" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                  {t.help.faq.questions.q3.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                  {t.help.faq.questions.q3.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2, bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="faq4-content"
                id="faq4-header"
              >
                <Typography variant="subtitle1" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                  {t.help.faq.questions.q4.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                  {t.help.faq.questions.q4.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2, bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="faq5-content"
                id="faq5-header"
              >
                <Typography variant="subtitle1" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                  {t.help.faq.questions.q5.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                  {t.help.faq.questions.q5.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Box mt={4} p={3} sx={{ bgcolor: 'rgba(168, 85, 247, 0.1)', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                {t.help.faq.cantFindQuestion}
              </Typography>
              <Typography paragraph sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                {t.help.faq.contactSupport}
              </Typography>
              <Button
                variant="contained"
                onClick={() => setCurrentTab(3)}
                sx={{ 
                  bgcolor: '#a855f7',
                  '&:hover': {
                    bgcolor: '#9333ea'
                  }
                }}
              >
                {t.help.faq.contactSupport}
              </Button>
            </Box>
          </Box>
        )}

        {/* About Tab */}
        {currentTab === 2 && (
          <Box p={3}>
            <Typography variant="h5" gutterBottom sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
              {t.help.about.title}
            </Typography>
            
            <Card sx={{ mb: 4, bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
              <CardContent>
                <Typography variant="h6" color="#a855f7" gutterBottom>
                  {t.app.name} - {t.app.tagline}
                </Typography>
                <Typography variant="body1" paragraph sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                  {t.help.about.description}
                </Typography>
                <Typography variant="body1" paragraph sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                  {t.help.about.version}
                </Typography>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
              {t.common.features}
            </Typography>
            <Grid container spacing={2} mb={4}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <ShoppingCartIcon sx={{ color: '#a855f7', mr: 1 }} />
                      <Typography variant="subtitle1" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                        {t.help.about.features.pos.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                      {t.help.about.features.pos.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <InventoryIcon sx={{ color: '#a855f7', mr: 1 }} />
                      <Typography variant="subtitle1" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                        {t.help.about.features.inventory.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                      {t.help.about.features.inventory.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Receipt sx={{ color: '#a855f7', mr: 1 }} />
                      <Typography variant="subtitle1" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                        {t.help.about.features.orders.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                      {t.help.about.features.orders.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <PeopleIcon sx={{ color: '#a855f7', mr: 1 }} />
                      <Typography variant="subtitle1" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                        {t.help.about.features.customers.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                      {t.help.about.features.customers.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
              {t.help.about.systemRequirements.title}
            </Typography>
            <Card sx={{ mb: 4, bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary={t.help.about.systemRequirements.requirements.os} 
                      primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText 
                      primary={t.help.about.systemRequirements.requirements.browser} 
                      primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText 
                      primary={t.help.about.systemRequirements.requirements.connection} 
                      primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText 
                      primary={t.help.about.systemRequirements.requirements.screen} 
                      primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
              {t.help.about.legalInformation.title}
            </Typography>
            <Card sx={{ bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
              <CardContent>
                <Typography variant="body2" paragraph sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                  {t.help.about.legalInformation.copyright}
                </Typography>
                <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                  <Link href="#" underline="hover" sx={{ color: '#a855f7' }}>
                    {t.help.about.legalInformation.termsOfService}
                  </Link>
                  <Link href="#" underline="hover" sx={{ color: '#a855f7' }}>
                    {t.help.about.legalInformation.privacyPolicy}
                  </Link>
                  <Link href="#" underline="hover" sx={{ color: '#a855f7' }}>
                    {t.help.about.legalInformation.licenseAgreement}
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Support Tab */}
        {currentTab === 3 && (
          <Box p={3}>
          <Typography variant="h5" gutterBottom sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
            {t.help.support.title}
          </Typography>
          
          <Grid container spacing={3}>

            <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <PublicIcon sx={{ color: '#a855f7', fontSize: 'large', mr: 2 }} />
                      <Typography variant="h6" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                        Online Documentation
                      </Typography>
                    </Box>
                    <Typography paragraph sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                      Access our comprehensive online help center with detailed guides, tutorials, and troubleshooting resources.
                    </Typography>
                    <Typography variant="body1" gutterBottom sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                      <strong>Website:</strong> https://v0-cashflow-website-design.vercel.app/
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: theme === 'light' ? '#718096' : '#919EAB' }}>
                      24/7 self-service support available
                    </Typography>
                    <Button
                      variant="outlined"
                      sx={{ 
                        mt: 2,
                        color: '#a855f7',
                        borderColor: '#a855f7',
                        '&:hover': {
                          borderColor: '#9333ea',
                          bgcolor: 'rgba(168, 85, 247, 0.08)'
                        }
                      }}
                      href="https://v0-cashflow-website-design.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Documentation
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <ContactSupportIcon sx={{ color: '#a855f7', fontSize: 'large', mr: 2 }} />
                      <Typography variant="h6" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                        {t.help.support.liveChat.title}
                      </Typography>
                    </Box>
                    <Typography paragraph sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                      {t.help.support.liveChat.description}
                    </Typography>
                    <Typography variant="body1" gutterBottom sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                      <strong>{t.common.time}:</strong> {t.help.support.liveChat.hours}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: theme === 'light' ? '#718096' : '#919EAB' }}>
                      {t.help.support.liveChat.waitTime}
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ 
                        mt: 2,
                        bgcolor: '#a855f7',
                        '&:hover': {
                          bgcolor: '#9333ea'
                        }
                      }}
                    >
                      {t.help.support.liveChat.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ bgcolor: theme === 'light' ? '#fff' : '#1E2022' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <HelpIcon sx={{ color: '#a855f7', fontSize: 'large', mr: 2 }} />
                      <Typography variant="h6" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                        {t.help.support.supportTicket.title}
                      </Typography>
                    </Box>
                    <Typography paragraph sx={{ color: theme === 'light' ? '#4A5568' : '#A0AEC0' }}>
                      {t.help.support.supportTicket.description}
                    </Typography>
                    <Box component="form" noValidate autoComplete="off">
                      <TextField
                        label={t.help.support.supportTicket.form.subject}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        placeholder="Brief description of your issue"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover fieldset': {
                              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#a855f7',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#a855f7',
                          },
                        }}
                      />
                      <TextField
                        label={t.help.support.supportTicket.form.description}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        multiline
                        rows={4}
                        placeholder="Please provide details about your issue or request"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover fieldset': {
                              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#a855f7',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#a855f7',
                          },
                        }}
                      />
                      <TextField
                        label={t.help.support.supportTicket.form.email}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        type="email"
                        placeholder="Your email address for correspondence"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover fieldset': {
                              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#a855f7',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#a855f7',
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        sx={{ 
                          mt: 2,
                          bgcolor: '#a855f7',
                          '&:hover': {
                            bgcolor: '#9333ea'
                          }
                        }}
                      >
                        {t.help.support.supportTicket.form.submit}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box mt={4}>
              <Typography variant="h6" gutterBottom sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
                {t.help.support.commonTopics.title}
              </Typography>
              <List>
                <ListItem button component={Link} href="#" underline="none" sx={{ mb: 1, bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)', borderRadius: 1 }}>
                <ListItemIcon>
                    <HelpIcon sx={{ color: '#a855f7' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t.help.support.commonTopics.passwordReset} 
                    primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                  />
                </ListItem>
                <ListItem button component={Link} href="#" underline="none" sx={{ mb: 1, bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)', borderRadius: 1 }}>
                  <ListItemIcon>
                    <HelpIcon sx={{ color: '#a855f7' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t.help.support.commonTopics.networkIssues} 
                    primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                  />
                </ListItem>
                <ListItem button component={Link} href="#" underline="none" sx={{ mb: 1, bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)', borderRadius: 1 }}>
                  <ListItemIcon>
                    <HelpIcon sx={{ color: '#a855f7' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t.help.support.commonTopics.dataImportExport} 
                    primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                  />
                </ListItem>
                <ListItem button component={Link} href="#" underline="none" sx={{ mb: 1, bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)', borderRadius: 1 }}>
                  <ListItemIcon>
                    <HelpIcon sx={{ color: '#a855f7' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t.help.support.commonTopics.printerSetup} 
                    primaryTypographyProps={{ color: theme === 'light' ? '#2D3748' : '#fff' }}
                  />
                </ListItem>
              </List>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default HelpHome;