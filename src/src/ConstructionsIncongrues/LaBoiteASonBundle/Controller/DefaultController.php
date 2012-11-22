<?php

namespace ConstructionsIncongrues\LaBoiteASonBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('ConstructionsIncongruesLaBoiteASonBundle:Default:index.html.twig');
    }
}
