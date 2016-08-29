<?php

class passwordHash {

    // blowfish
    private static $algo = '$2a';
    // cost parameter
    private static $cost = '$10';

    // mainly for internal use
    public static function unique_salt() {
        return substr(sha1(mt_rand()), 0, 22);
    }

    // this will be used to generate a hash
    public static function hash($senha) {
        return crypt($senha, self::$algo .
                self::$cost .
                '$' . self::unique_salt());
    }

    // this will be used to compare a password against a hash
    public static function check_password($hash, $senha) {
        $full_salt = substr($hash, 0, 29);
        $new_hash = crypt($senha, $full_salt);
        return ($hash == $new_hash);
    }

}

?>
