-- =======================================================
-- Migration: Fix profiles RLS recursion using SECURITY DEFINER function
-- Date: 2026-07-17 23:20:00
-- =======================================================

-- 1. Nettoyage de l'ancienne politique défaillante
-- On supprime la politique RLS "Admins can view all profiles" car elle interrogeait
-- directement la table "profiles" dans son corps, provoquant une récursion infinie (boucle infinie).
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. Création de la fonction utilitaire de contournement de RLS
-- Cette fonction est déclarée "SECURITY DEFINER", ce qui signifie qu'elle s'exécute
-- avec les privilèges du créateur (le super-utilisateur PostgreSQL).
-- Cela permet d'interroger la table "profiles" en interne pour vérifier si l'utilisateur
-- connecté (auth.uid()) possède bien le rôle 'admin', sans déclencher les politiques RLS de la table.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_admin() IS 'Vérifie si l''utilisateur connecté est un administrateur en contournant la RLS.';

-- 3. Création de la nouvelle politique saine de sélection des profils
-- Grâce à la fonction "is_admin()" qui s'exécute de façon privilégiée,
-- cette politique permet aux administrateurs de lister et lire l''ensemble des profils
-- sans déclencher de boucle de récursion.
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin());

-- 4. Nettoyage et mise à jour de la politique d'accès aux feedbacks
-- Par cohérence et sécurité, on met également à jour la politique d'accès aux avis (feedbacks)
-- pour utiliser la nouvelle fonction utilitaire "is_admin()".
DROP POLICY IF EXISTS "Admins can view all feedbacks" ON public.feedbacks;

CREATE POLICY "Admins can view all feedbacks" 
ON public.feedbacks 
FOR SELECT 
USING (public.is_admin());
