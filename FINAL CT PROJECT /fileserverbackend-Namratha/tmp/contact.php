<!DOCTYPE html>
<html lang="en">
   <?php include('head.html'); ?>
   <!-- body -->
   <body class="main-layout inner_page">
      <!-- loader  -->
      <div class="loader_bg">
         <div class="loader"><img src="images/loading.gif" alt="#"/></div>
      </div>
      <!-- end loader -->
      <!-- header -->
      <header class="full_bg">
         <!-- header inner -->
            <?php include('header.html'); ?>
         <!-- end header inner -->
         <!-- end header -->
         <!-- banner -->
      </header>
      <!-- end banner -->
    <div class="back_re">
         <div class="container">
            <div class="row">
               <div class="col-md-12">
                  <div class="title">
                     <h2>Contact Us</h2>
                  </div>
               </div>
            </div>
         </div>
      </div>
      <!--  contact -->
      <div class="classes">
         <div class="container">
            <div class="row">
               <div class="col-sm-12">
                  <div class="titlepage">
                     <span>The below contact details are read from a text file.</span>
                  </div>
               </div>
            </div>
            <?php
               $txt_file = fopen('contact_details.txt','r');
               $name = fgets($txt_file);
               $email = fgets($txt_file);
               $mobile = fgets($txt_file);
               fclose($txt_file);
            ?>

            <div class="row">
               <div class="col-md-4 col-sm-6">
                  <div class="our_yoga">
                     <h3>Address</h3>
                     <span><?php echo($name)."<br>"; ?></span>
                  </div>
               </div>
               <div class="col-md-4 col-sm-6">
                  <div class="our_yoga">
                     <h3>EMAIL</h3>
                     <span><?php echo($email)."<br>"; ?></span>
                  </div>
               </div>
               <div class="col-md-4 col-sm-6">
                  <div class="our_yoga">
                     <h3>MOBILE</h3>
                     <span><?php echo($mobile)."<br>"; ?></span>
                  </div>
               </div>
            </div>
         </div>
      </div>
      
      <!-- end contact -->
      <!--  footer -->
         <?php include('footer.html'); ?>
      <!-- end footer -->
      <!-- Javascript files-->
      <script src="js/jquery.min.js"></script>
      <script src="js/bootstrap.bundle.min.js"></script>
      <script src="js/jquery-3.0.0.min.js"></script>
      <!-- sidebar -->
      <script src="js/jquery.mCustomScrollbar.concat.min.js"></script>
      <script src="js/custom.js"></script>
   </body>
</html>